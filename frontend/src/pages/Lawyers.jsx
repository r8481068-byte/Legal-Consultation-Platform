import ClientFindLawyers from "./ClientFindLawyers";

/**
 * Lawyers discovery page under PublicLayout.
 * Reuses the unified Available Advocates interface and lawyer listing APIs.
 */
export default function Lawyers() {
  return <ClientFindLawyers isPublicLayout={true} />;
}
