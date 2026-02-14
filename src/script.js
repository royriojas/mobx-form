const getRatesForVehicles = async (startDate, endDate, vehicleNames = []) => {
  const resp = await fetch(
    `https://api.clickrent.es/api/bookings/groups?pickupDatetime=${startDate}%2011:45&dropoffDatetime=${endDate}%2011:30&pickupLocation=2&dropoffLocation=2&brand=CLICKRENT`,
    {
      headers: {
        accept: '*/*',
        'accept-language': 'es,en-US;q=0.9,en;q=0.8',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
      referrer: 'https://clickrent.es/',
      body: null,
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    },
  );

  const respJson = await resp.json();

  const entries = respJson.groups.filter(e => vehicleNames.includes(e.commercialName));

  const prices = entries.map(e => {
    const rates = e.rates;
    return `${e.commercialName} => ${rates.map(rate => `pd:${rate.precioDia}, pt:${rate.precio} x ${rate.diasReserva}`).join('\n')}`;
  });

  console.log(prices.join('\n\n'));

  return respJson;
};

await getRatesForVehicles('2026-01-23', '2026-02-19', ['VW T-Cross Automatic']);
