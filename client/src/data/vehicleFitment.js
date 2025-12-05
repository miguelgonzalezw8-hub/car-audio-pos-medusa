// src/data/vehicleFitment.js

// This is a SAMPLE. Later this will be auto-generated from your CSVs.
export const vehicleFitment = [
  {
    yearStart: 2015,
    yearEnd: 2020,
    make: "Dodge",
    model: "Charger",
    trim: "All",
    body: "Sedan",
    radio: {
      dashKit: "95-6511",
      harness: "70-6520",
      antennaAdapter: "40-CR10",
      ampBypass: null,
    },
    speakers: {
      front: [
        {
          location: "Front Door",
          size: '6.5"',
          adapter: "82-4201",
          harness: null,
        },
      ],
      rear: [
        {
          location: "Rear Deck",
          size: '6x9"',
          adapter: null,
          harness: null,
        },
      ],
      other: [],
    },
  },

  {
    yearStart: 2018,
    yearEnd: 2022,
    make: "Honda",
    model: "Civic",
    trim: "EX",
    body: "Sedan",
    radio: {
      dashKit: "95-7810",
      harness: "70-1729",
      antennaAdapter: "40-HD11",
      ampBypass: null,
    },
    speakers: {
      front: [
        { location: "Front Door", size: '6.5"', adapter: null, adapterHarness: null },
        { location: "Dash", size: '3.5"', adapter: null, harness: null },
      ],
      rear: [
        { location: "Rear Deck", size: '6x9"', adapter: null, harness: null },
      ],
      other: [],
    },
  },
];
