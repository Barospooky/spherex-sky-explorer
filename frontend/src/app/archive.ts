/** Future archive adapter contract. No archive implementation or demo scientific records.
 * Populate only from verified source metadata; retain source URLs and supplied units.
 * Unknown metadata must remain null. Never substitute generated observations.
 */
export interface ArchiveObservation {
  id: string;
  sourceUrl: string;
  observedAt: string | null;
  wavelength: { value: number; unit: string } | null;
  imageUrl: string | null;
}
export interface SpherexArchive {
  listObservations(signal?: AbortSignal): Promise<ArchiveObservation[]>;
}
