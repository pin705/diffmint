import { createPrivateKey, createPublicKey, sign, verify, type KeyObject } from 'node:crypto';
import type { ReleaseManifest, ReleaseManifestSignature } from '@diffmint/contracts';

type EnvLike = NodeJS.ProcessEnv | Record<string, string | undefined>;

const DEFAULT_RELEASE_SIGNING_KEY_ID = 'diffmint-release';
const RELEASE_SIGNATURE_ALGORITHM: ReleaseManifestSignature['algorithm'] = 'ed25519';

function normalizePem(value: string): string {
  return value.includes('\\n') ? value.replace(/\\n/g, '\n') : value;
}

function getUnsignedReleaseManifest(manifest: ReleaseManifest): ReleaseManifest {
  const { signature, ...unsignedManifest } = manifest;
  void signature;

  return unsignedManifest;
}

function buildReleaseSignatureMetadata(
  manifest: ReleaseManifest,
  keyId: string
): Omit<ReleaseManifestSignature, 'value'> {
  return {
    algorithm: RELEASE_SIGNATURE_ALGORITHM,
    keyId,
    signedAt: manifest.releasedAt
  };
}

function serializeReleaseManifestPayload(
  manifest: ReleaseManifest,
  metadata?: Omit<ReleaseManifestSignature, 'value'>
): Buffer {
  const unsignedManifest = getUnsignedReleaseManifest(manifest);

  return Buffer.from(
    JSON.stringify({
      channel: unsignedManifest.channel,
      version: unsignedManifest.version,
      releasedAt: unsignedManifest.releasedAt,
      cli: {
        version: unsignedManifest.cli.version,
        downloadUrl: unsignedManifest.cli.downloadUrl,
        checksum: unsignedManifest.cli.checksum
      },
      vscode: {
        version: unsignedManifest.vscode.version,
        marketplaceUrl: unsignedManifest.vscode.marketplaceUrl,
        checksum: unsignedManifest.vscode.checksum
      },
      notesUrl: unsignedManifest.notesUrl ?? null,
      signature: metadata
        ? {
            algorithm: metadata.algorithm,
            keyId: metadata.keyId,
            signedAt: metadata.signedAt
          }
        : null
    })
  );
}

function getReleaseManifestSigningConfig(env: EnvLike = process.env): {
  privateKey: string;
  keyId: string;
} | null {
  const privateKey = env.DIFFMINT_RELEASE_SIGNING_PRIVATE_KEY?.trim();

  if (!privateKey) {
    return null;
  }

  return {
    privateKey: normalizePem(privateKey),
    keyId: env.DIFFMINT_RELEASE_SIGNING_KEY_ID?.trim() || DEFAULT_RELEASE_SIGNING_KEY_ID
  };
}

export function signReleaseManifest(
  manifest: ReleaseManifest,
  env: EnvLike = process.env
): ReleaseManifest {
  const unsignedManifest = getUnsignedReleaseManifest(manifest);
  const config = getReleaseManifestSigningConfig(env);

  if (!config) {
    return unsignedManifest;
  }

  const signatureMetadata = buildReleaseSignatureMetadata(unsignedManifest, config.keyId);
  const signatureValue = sign(
    null,
    serializeReleaseManifestPayload(unsignedManifest, signatureMetadata),
    createPrivateKey(config.privateKey)
  ).toString('base64');

  return {
    ...unsignedManifest,
    signature: {
      ...signatureMetadata,
      value: signatureValue
    }
  };
}

export function signReleaseManifests(
  manifests: ReleaseManifest[],
  env: EnvLike = process.env
): ReleaseManifest[] {
  return manifests.map((manifest) => signReleaseManifest(manifest, env));
}

export function verifyReleaseManifestSignature(
  manifest: ReleaseManifest,
  publicKey: string | KeyObject
): boolean {
  if (!manifest.signature) {
    return false;
  }

  const key = typeof publicKey === 'string' ? createPublicKey(normalizePem(publicKey)) : publicKey;
  const { value, ...signatureMetadata } = manifest.signature;

  return verify(
    null,
    serializeReleaseManifestPayload(manifest, signatureMetadata),
    key,
    Buffer.from(value, 'base64')
  );
}
