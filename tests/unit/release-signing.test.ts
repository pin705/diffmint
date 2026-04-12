import { generateKeyPairSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  signReleaseManifest,
  verifyReleaseManifestSignature
} from '../../apps/web/src/lib/releases/manifest-signing.ts';

const baseManifest = {
  channel: 'stable',
  version: '0.1.0',
  releasedAt: '2026-04-12T00:00:00.000Z',
  cli: {
    version: '0.1.0',
    downloadUrl: 'https://diffmint.io/downloads/dm',
    checksum: 'sha256-cli'
  },
  vscode: {
    version: '0.1.0',
    marketplaceUrl: 'https://diffmint.io/downloads/vscode',
    checksum: 'sha256-vscode'
  },
  notesUrl: 'https://diffmint.io/docs/changelog/2026-04-foundation'
} as const;

describe('release manifest signing', () => {
  it('returns unsigned manifests when no private key is configured', () => {
    const unsignedManifest = signReleaseManifest(baseManifest, {});

    expect(unsignedManifest.signature).toBeUndefined();
  });

  it('signs release manifests deterministically and verifies the signature', () => {
    const { privateKey, publicKey } = generateKeyPairSync('ed25519');
    const signingEnv = {
      DIFFMINT_RELEASE_SIGNING_PRIVATE_KEY: privateKey.export({
        format: 'pem',
        type: 'pkcs8'
      }),
      DIFFMINT_RELEASE_SIGNING_KEY_ID: 'release-key-2026-04'
    };

    const signedManifest = signReleaseManifest(baseManifest, signingEnv);
    const signedManifestAgain = signReleaseManifest(baseManifest, signingEnv);

    expect(signedManifest.signature).toEqual({
      algorithm: 'ed25519',
      keyId: 'release-key-2026-04',
      signedAt: baseManifest.releasedAt,
      value: signedManifest.signature?.value
    });
    expect(signedManifest.signature?.value).toBe(signedManifestAgain.signature?.value);
    expect(
      verifyReleaseManifestSignature(
        signedManifest,
        publicKey.export({
          format: 'pem',
          type: 'spki'
        })
      )
    ).toBe(true);
  });
});
