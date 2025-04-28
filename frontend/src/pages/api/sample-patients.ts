import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

interface PatientData {
  patients: any[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PatientData | { error: string }>
) {
  try {
    // This is a simplified approach for demo purposes
    // In production, you would read the actual files from the backend
    
    // Sample Kansas patient records
    const patients = [
      {
        "resourceType": "Patient",
        "id": "patient-1",
        "name": [
          {
            "use": "official",
            "family": "Smith",
            "given": ["John", "Jacob"],
            "prefix": ["Mr."]
          }
        ],
        "gender": "male",
        "birthDate": "1980-01-15",
        "address": [
          {
            "line": ["123 Main St"],
            "city": "Kansas City",
            "state": "KS",
            "postalCode": "66101",
            "extension": [
              {
                "url": "http://hl7.org/fhir/StructureDefinition/geolocation",
                "extension": [
                  {
                    "url": "latitude",
                    "valueDecimal": 39.1155
                  },
                  {
                    "url": "longitude",
                    "valueDecimal": -94.6268
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "resourceType": "Patient",
        "id": "patient-2",
        "name": [
          {
            "use": "official",
            "family": "Johnson",
            "given": ["Mary", "Anne"],
            "prefix": ["Mrs."]
          }
        ],
        "gender": "female",
        "birthDate": "1975-06-22",
        "address": [
          {
            "line": ["456 Oak St"],
            "city": "Wichita",
            "state": "KS",
            "postalCode": "67202",
            "extension": [
              {
                "url": "http://hl7.org/fhir/StructureDefinition/geolocation",
                "extension": [
                  {
                    "url": "latitude",
                    "valueDecimal": 37.6872
                  },
                  {
                    "url": "longitude", 
                    "valueDecimal": -97.3301
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "resourceType": "Patient",
        "id": "patient-3",
        "name": [
          {
            "use": "official",
            "family": "Williams",
            "given": ["Robert"],
            "prefix": ["Mr."]
          }
        ],
        "gender": "male",
        "birthDate": "1990-10-05",
        "address": [
          {
            "line": ["789 Pine Rd"],
            "city": "Topeka",
            "state": "KS",
            "postalCode": "66603",
            "extension": [
              {
                "url": "http://hl7.org/fhir/StructureDefinition/geolocation",
                "extension": [
                  {
                    "url": "latitude",
                    "valueDecimal": 39.0558
                  },
                  {
                    "url": "longitude",
                    "valueDecimal": -95.6894
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "resourceType": "Patient",
        "id": "patient-4",
        "name": [
          {
            "use": "official",
            "family": "Brown",
            "given": ["Margaret", "Susan"],
            "prefix": ["Ms."]
          }
        ],
        "gender": "female",
        "birthDate": "1985-03-30",
        "address": [
          {
            "line": ["101 Cedar Blvd"],
            "city": "Lawrence",
            "state": "KS", 
            "postalCode": "66044",
            "extension": [
              {
                "url": "http://hl7.org/fhir/StructureDefinition/geolocation",
                "extension": [
                  {
                    "url": "latitude",
                    "valueDecimal": 38.9717
                  },
                  {
                    "url": "longitude",
                    "valueDecimal": -95.2353
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "resourceType": "Patient",
        "id": "patient-5",
        "name": [
          {
            "use": "official",
            "family": "Miller",
            "given": ["James", "Robert"],
            "prefix": ["Mr."]
          }
        ],
        "gender": "male",
        "birthDate": "1972-11-12",
        "address": [
          {
            "line": ["222 Maple Dr"],
            "city": "Overland Park",
            "state": "KS",
            "postalCode": "66210",
            "extension": [
              {
                "url": "http://hl7.org/fhir/StructureDefinition/geolocation",
                "extension": [
                  {
                    "url": "latitude",
                    "valueDecimal": 38.9822
                  },
                  {
                    "url": "longitude",
                    "valueDecimal": -94.6708
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "resourceType": "Patient",
        "id": "patient-6",
        "name": [
          {
            "use": "official",
            "family": "Davis",
            "given": ["Patricia"],
            "prefix": ["Mrs."]
          }
        ],
        "gender": "female",
        "birthDate": "1988-07-18",
        "address": [
          {
            "line": ["333 Elm Ct"],
            "city": "Manhattan",
            "state": "KS",
            "postalCode": "66502",
            "extension": [
              {
                "url": "http://hl7.org/fhir/StructureDefinition/geolocation",
                "extension": [
                  {
                    "url": "latitude",
                    "valueDecimal": 39.1836
                  },
                  {
                    "url": "longitude",
                    "valueDecimal": -96.5716
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "resourceType": "Patient",
        "id": "patient-7",
        "name": [
          {
            "use": "official",
            "family": "Wilson",
            "given": ["Thomas", "Edward"],
            "prefix": ["Mr."]
          }
        ],
        "gender": "male",
        "birthDate": "1965-04-02",
        "address": [
          {
            "line": ["444 Birch St"],
            "city": "Salina",
            "state": "KS",
            "postalCode": "67401",
            "extension": [
              {
                "url": "http://hl7.org/fhir/StructureDefinition/geolocation",
                "extension": [
                  {
                    "url": "latitude",
                    "valueDecimal": 38.8402
                  },
                  {
                    "url": "longitude",
                    "valueDecimal": -97.6114
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "resourceType": "Patient",
        "id": "patient-8",
        "name": [
          {
            "use": "official",
            "family": "Moore",
            "given": ["Jennifer", "Lynn"],
            "prefix": ["Ms."]
          }
        ],
        "gender": "female",
        "birthDate": "1992-12-25",
        "address": [
          {
            "line": ["555 Walnut Ave"],
            "city": "Hays",
            "state": "KS",
            "postalCode": "67601",
            "extension": [
              {
                "url": "http://hl7.org/fhir/StructureDefinition/geolocation",
                "extension": [
                  {
                    "url": "latitude",
                    "valueDecimal": 38.8793
                  },
                  {
                    "url": "longitude",
                    "valueDecimal": -99.3268
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "resourceType": "Patient",
        "id": "patient-9",
        "name": [
          {
            "use": "official",
            "family": "Taylor",
            "given": ["Michael", "John"],
            "prefix": ["Mr."]
          }
        ],
        "gender": "male",
        "birthDate": "1978-09-15",
        "address": [
          {
            "line": ["666 Cherry Ln"],
            "city": "Dodge City",
            "state": "KS",
            "postalCode": "67801",
            "extension": [
              {
                "url": "http://hl7.org/fhir/StructureDefinition/geolocation",
                "extension": [
                  {
                    "url": "latitude",
                    "valueDecimal": 37.7528
                  },
                  {
                    "url": "longitude",
                    "valueDecimal": -100.0171
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "resourceType": "Patient",
        "id": "patient-10",
        "name": [
          {
            "use": "official",
            "family": "Anderson",
            "given": ["Elizabeth", "Marie"],
            "prefix": ["Mrs."]
          }
        ],
        "gender": "female",
        "birthDate": "1982-08-07",
        "address": [
          {
            "line": ["777 Peach Blvd"],
            "city": "Garden City",
            "state": "KS",
            "postalCode": "67846",
            "extension": [
              {
                "url": "http://hl7.org/fhir/StructureDefinition/geolocation",
                "extension": [
                  {
                    "url": "latitude",
                    "valueDecimal": 37.9716
                  },
                  {
                    "url": "longitude",
                    "valueDecimal": -100.8726
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    res.status(200).json({ patients });
  } catch (error) {
    console.error('Error in sample-patients API:', error);
    res.status(500).json({ error: 'Failed to load sample patient data', patients: [] });
  }
}