/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const BANKS = [
  {
    id: "1",
    title: "Bank of America",
    country_code: "1",
  },
  {
    id: "2",
    title: "JPMorgan Chase",
    country_code: "1",
  },
  {
    id: "3",
    title: "Wells Fargo",
    country_code: "1",
  },
  {
    id: "4",
    title: "Citibank",
    country_code: "1",
  },
  {
    id: "5",
    title: "Banco Pichincha",
    country_code: "2",
  },
  {
    id: "6",
    title: "Banco del Pacífico",
    country_code: "2",
  },
  {
    id: "7",
    title: "Banco Guayaquil",
    country_code: "2",
  },
  {
    id: "8",
    title: "Produbanco",
    country_code: "2",
  },
  {
    id: "9",
    title: "Banco General",
    country_code: "3",
  },
  {
    id: "10",
    title: "Banco Nacional de Panamá",
    country_code: "3",
  },
  {
    id: "11",
    title: "Multibank",
    country_code: "3",
  },
  {
    id: "12",
    title: "Barclays",
    country_code: "4",
  },
  {
    id: "13",
    title: "HSBC UK",
    country_code: "4",
  },
  {
    id: "14",
    title: "Lloyds Bank",
    country_code: "4",
  },
  {
    id: "15",
    title: "NatWest",
    country_code: "4",
  },
];

// this object is generated from Flow Builder under "..." > Endpoint > Snippets > Responses
const SCREEN_RESPONSES = {
  START: {
    screen: "START",
    data: {
      country: [
        {
          id: "1",
          title: "EEUU",
        },
        {
          id: "2",
          title: "Ecuador",
        },
        {
          id: "3",
          title: "Panama",
        },
        {
          id: "4",
          title: "Inglaterra",
        },
      ],
      bank: [
        {
          id: "1",
          title: "Pichincha",
        },
        {
          id: "2",
          title: "Panama Bank",
        },
        {
          id: "3",
          title: "Bank of Bank",
        },
        {
          id: "4",
          title: "BBVA",
        },
      ],
      is_bank_enabled: true,
      fullname: "",
      account: 0,
      amount: 0,
    },
  },
  SUMMARY: {
    screen: "SUMMARY",
    data: {
      details: [
        "**Name:** John Doe",
        "**Email:** john@example.com",
        "**Phone:** 123456789",
        "A free skin care consultation, please",
      ],
      more_details: "A free skin care consultation, please",
    },
  },
  TERMS: {
    screen: "TERMS",
    data: {},
  },
  SUCCESS: {
    screen: "SUCCESS",
    data: {
      extension_message_response: {
        params: {
          flow_token: "REPLACE_FLOW_TOKEN",
          some_param_name: "PASS_CUSTOM_VALUE",
        },
      },
    },
  },
};

export const getNextScreen = async (decryptedBody) => {
  const { screen, data, version, action, flow_token } = decryptedBody;
  // handle health check request
  if (action === "ping") {
    return {
      data: {
        status: "active",
      },
    };
  }

  // handle error notification
  if (data?.error) {
    console.warn("Received client error:", data);
    return {
      data: {
        acknowledged: true,
      },
    };
  }

  // handle initial request when opening the flow and display START screen
  if (action === "INIT") {
    return {
      ...SCREEN_RESPONSES.START,
      data: {
        ...SCREEN_RESPONSES.START.data,
        // these fields are disabled initially. Each field is enabled when previous fields are selected
        is_bank_enabled: false,
      },
    };
  }

  if (action === "data_exchange") {
    // handle the request based on the current screen
    switch (screen) {
      // handles when user interacts with START screen
      case "START":
        console.log("User selected start data:", data);
        const filteredBanks = BANKS.filter(
          (bank) => bank.country_code === data.country
        ).map((bank) => ({ id: bank.id, title: bank.title }));
        if (data.trigger === "country_selected") {
          // search banks based on selected country without country_code
          return {
            ...SCREEN_RESPONSES.START,
            data: {
              ...SCREEN_RESPONSES.START.data,
              bank: filteredBanks,
              // each field is enabled only when previous fields are selected
              is_bank_enabled: Boolean(data.country),
            },
          };
        }
        // update the start fields based on current user selection
        // print detail of bank and country selected search with id
        const selectedBank = filteredBanks.find(
          (bank) => bank.id === data.bank
        );
        console.log("Selected bank:", selectedBank);
        const selectedCountry = SCREEN_RESPONSES.START.data.country.find(
          (country) => country.id === data.country
        );
        console.log("Selected country name:", selectedCountry);
        return {
          ...SCREEN_RESPONSES.SUMMARY,
          data: {
            details: [
              `**Country:** ${selectedCountry.title}`,
              `**Bank:** ${selectedBank.title}`,
              `**Full Name:** ${data.fullname}`,
              `**Account Number:** ${data.account}`,
              `**Amount:** $${data.amount}`,
            ],
          },
        };

      // handles when user completes SUMMARY screen
      case "SUMMARY":
        // TODO: save start to your database
        // send success response to complete and close the flow
        return {
          ...SCREEN_RESPONSES.SUCCESS,
          data: {
            extension_message_response: {
              params: {
                flow_token,
              },
            },
          },
        };

      default:
        break;
    }
  }

  console.error("Unhandled request body:", decryptedBody);
  throw new Error(
    "Unhandled endpoint request. Make sure you handle the request action & screen logged above."
  );
};
