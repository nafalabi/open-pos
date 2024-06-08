const currencyFormatter = new Intl.NumberFormat("id-ID", {
	style: "currency",
	currency: "IDR",
});

export const currency = (currency: number) => currencyFormatter.format(currency)