const bedrag = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 });

/** Euro-formaat zoals in Pakketten: 3250 wordt "€3.250". */
export function euro(prijs: number): string {
  return `€${bedrag.format(prijs)}`;
}
