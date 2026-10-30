/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SafetyGuidance {
  destination: string;
  general_advice: string[];
  emergency_numbers: { title: string; number: string; available: string }[];
  scam_awareness: { title: string; explanation: string; tip: string }[];
  transport_safety: string[];
  food_water_safety: string[];
  cultural_etiquette: string[];
  mountain_or_coastal_precautions: string[];
  official_disclaimer: string;
}

export class SafetyAgent {
  public getSafetyGuidance(destination: string): SafetyGuidance {
    const isJaipur = destination.toLowerCase().includes('jaipur');
    const isGoa = destination.toLowerCase().includes('goa');
    const isParis = destination.toLowerCase().includes('paris');
    const isAgra = destination.toLowerCase().includes('agra');
    const isTamilNadu = destination.toLowerCase().includes('tamil') || destination.toLowerCase().includes('madurai');
    const isMountain = destination.toLowerCase().includes('manali') || destination.toLowerCase().includes('ooty') || destination.toLowerCase().includes('hill');

    const general_advice = [
      'Keep copies of passports and ID cards stored in a secure cloud folder or hotel safety box.',
      'Stay aware of personal belongings in crowded bazaars, transit hubs, and monument entry lines.',
      'Use registered ride-hailing apps or official prepaid booths rather than unmetered curbside solicitors.',
      'Ensure travel medical insurance covers unforeseen transit cancellations and acute altitude/health care.'
    ];

    let emergency_numbers = [
      { title: 'National Emergency Universal Helpline', number: '112', available: '24/7 Toll-Free' },
      { title: 'Ministry of Tourism Tourist Info Line', number: '1363 / 1800-111-363', available: '24/7 Multi-lingual' },
      { title: 'Women Safety Helpline', number: '1091', available: '24/7 Immediate Response' },
      { title: 'Ambulance & Medical Emergency', number: '108', available: '24/7' }
    ];

    if (isParis) {
      emergency_numbers = [
        { title: 'European Universal Emergency Line', number: '112', available: '24/7 Multi-lingual' },
        { title: 'SAMU Medical Emergency Service', number: '15', available: '24/7 Rapid Ambulance' },
        { title: 'Police Secours (National Police)', number: '17', available: '24/7 Emergency Dispatch' },
        { title: 'Fire Brigade & Paramedics (Sapeurs-Pompiers)', number: '18', available: '24/7 Emergency' }
      ];
    }

    let scam_awareness = [
      {
        title: 'Gemstone & Jewelry Export Commission Scheme',
        explanation: 'Friendly strangers or auto drivers may urge you to buy stones to resell abroad for easy profit or claim special government artisan discounts.',
        tip: 'Politely refuse all investment schemes. Purchase only from government-certified emporiums with receipt.'
      },
      {
        title: 'Unlicensed Monument "Volunteers"',
        explanation: 'Individuals outside forts offering unauthorized guided tours who later demand inflated tips or divert to partner souvenir shops.',
        tip: 'Hire only official licensed guides wearing official badge cards from the monument ticket counter.'
      },
      {
        title: 'Fast Meter & Detour Taxis',
        explanation: 'Driver claims the booked hotel is "closed down", "caught fire", or "booked full" and redirects you to a commission-paying property.',
        tip: 'Insist firmly on going to your reserved destination. Never change hotels based solely on a driver\'s claim.'
      }
    ];

    if (isParis) {
      scam_awareness = [
        {
          title: 'The Friendship String / Bracelet Trap',
          explanation: 'Aggressive men on the Sacré-Cœur steps or Champ de Mars grab your wrist, tie a colorful woven string, and demand €20-€50.',
          tip: 'Walk past with hands firmly in your pockets. Say a firm "Non, merci" and do not stop or engage.'
        },
        {
          title: 'Fake Petition & Clipboard Signers',
          explanation: 'Young individuals asking you to sign a charity petition for deaf children around the Eiffel Tower or Louvre while accomplices pickpocket your bag.',
          tip: 'Completely ignore clipboard solicitations; official French charities never canvass in this manner at monuments.'
        },
        {
          title: 'Unlicensed Airport "Taxis"',
          explanation: 'Drivers approaching inside terminal arrivals offering "taxi pas cher" who charge €150+ instead of the regulated official flat fare (€56-€65).',
          tip: 'Follow the official ground signs to the official taxi queue outside where rates to Paris center are legally capped.'
        }
      ];
    } else if (isAgra) {
      scam_awareness = [
        {
          title: 'Marble Factory Diversion',
          explanation: 'Drivers or guides insist on stopping at "ancestral marble artisans" who claim direct descent from Taj Mahal builders and aggressively sell soapstone.',
          tip: 'Firmly state you only wish to travel to your planned monument or hotel. Authentic pietra dura pieces have certified invoice cards.'
        },
        {
          title: 'VIP Fast-Track Ticket Resellers',
          explanation: 'Touts outside Taj Ganj claiming tickets are "sold out online" and offering paper slips at double the rate.',
          tip: 'Purchase your official ticket through the official ASI ASI-Pay portal or ticket windows directly.'
        }
      ];
    }

    let transport_safety = [
      'In auto-rickshaws, confirm meter usage or agree on the total fare before boarding.',
      'For night travel, favor app-tracked vehicles (Uber, Ola) or verified hotel private chauffeur cars.',
      'Fasten seatbelts even on rear seats when traveling on national highways and expressways.'
    ];

    let food_water_safety = [
      'Drink exclusively sealed bottled mineral water or purified UV/RO water from trusted hotels and cafes.',
      'Avoid unpeeled fruits and street ice; savor freshly fried kachoris, hot thalis, and cooked foods served piping hot.',
      'Carry oral rehydration salts (ORS) and electrolyte sachets during warm midday touring.'
    ];

    let cultural_etiquette = [
      'Dress respectfully with covered shoulders and knees when entering temples, mosques, and gurdwaras.',
      'Remove shoes outside sanctums; shoe-deposit counters are provided at entrance gates.',
      'Always request permission before photographing local artisans, monks, or families.'
    ];

    let mountain_or_coastal_precautions: string[] = [];

    if (isMountain) {
      mountain_or_coastal_precautions = [
        'Avoid driving on unfamiliar mountain switchbacks after dusk due to unlit turns and dense fog patches.',
        'Check real-time road clearance bulletins for landslide-prone zones during monsoon or heavy rainfall.',
        'Carry physical offline navigation maps and power banks, as cellular reception drops sharply in valleys.',
        'Never pitch tents or park vehicles adjacent to steep loose scree slopes or turbulent riverbanks.',
        'Allow 24 hours of gradual acclimatization before engaging in strenuous high-altitude trekking.'
      ];
    } else if (isGoa) {
      mountain_or_coastal_precautions = [
        'Swim only between red-and-yellow flags patrolled by Drishti Marine lifeguards; obey red no-swim warning flags.',
        'Avoid swimming during monsoon swell (June-September) due to dangerous underwater rip currents.',
        'Wear an ISI-certified helmet and carry a valid license when renting self-drive scooters or motorbikes.',
        'Do not leave alcoholic beverages unattended at beachfront shacks or nightclub parties.'
      ];
    } else {
      // Urban heritage like Jaipur / Delhi
      mountain_or_coastal_precautions = [
        'Wear polarized sunglasses and wide-brim hats during open-courtyard fort walks to prevent heat exhaustion.',
        'Watch your step on worn 16th-century marble stairs and steep fort inclines; wear non-slip sneakers.',
        'Keep emergency hydration handy when climbing Nahargarh or Jaigarh ramparts.'
      ];
    }

    return {
      destination,
      general_advice,
      emergency_numbers,
      scam_awareness,
      transport_safety,
      food_water_safety,
      cultural_etiquette,
      mountain_or_coastal_precautions,
      official_disclaimer:
        'This safety guidance is advisory and curated for general informational awareness. Travelers must always consult official local civil administration and government emergency advisories.'
    };
  }
}

export const safetyAgent = new SafetyAgent();
