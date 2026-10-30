const bedrag = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 });

/** Euro-formaat zoals in Pakketten: 3950 wordt "€3.950". */
export function euro(prijs: number): string {
  return `€${bedrag.format(prijs)}`;
}
