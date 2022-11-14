/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable camelcase */
const { request, gql } = require('graphql-request');
const { universeIdFromAssetId } = require('./universeUtils');

/*
PARSES EVENTS FROM AN L2 NODE
In this example, only 'transfer' events are parsed

INPUTS:
* endpoint: the URL of the L2 node (this example uses a local node)
* eventType: the type of event to parse (check graphQL's introspection for a list of event types);
* universeId: the universe for which events want to be parsed; if 'undefined' => no universe filter
* maxEventsPerQuery: the max events that the L2 node exposes per query
* eventIdxStart: the starting event idx
* eventIdxStop: the stop event idx
*/

const endpoint = 'http://0.0.0.0:4000/graphql';
const eventType = 'transfer';
const universeId = 4;
const maxEventsPerQuery = 1000;
const eventIdxStart = 0;
const eventIdxStop = 200000;

async function getEvents(offset, first) {
  const query = gql`
    query ($offset: Int!, $first: Int!) {
      allEvents(offset: $offset, first: $first) {
        nodes {
          type
          idx
          event
        }
      }
    }
  `;
  const result = await request(endpoint, query, { offset, first });
  return result?.allEvents;
}

function matchesCriteria(e) {
  if (e.type !== eventType) return false;
  if (!universeId) return true;
  return universeIdFromAssetId(JSON.parse(e.event).asset_id) === universeId;
}

function printEvent(e) {
  const event = JSON.parse(e.event);
  console.log(`New ${eventType} event:
  - universe =  ${universeIdFromAssetId(event.asset_id)}
  - verse =  ${event.tx_verse}
  - assetId = ${event.asset_id}
  - transferredTo = ${event.address}`);
  console.log();
}

const run = async () => {
  for (let offset = eventIdxStart; offset < eventIdxStop; offset += maxEventsPerQuery) {
    console.log(`Fetching ${maxEventsPerQuery} events of type "${eventType}", starting from eventIdx: ${offset}`);

    const result = await getEvents(offset, maxEventsPerQuery);
    result.nodes.forEach((e) => { if (matchesCriteria(e)) printEvent(e); });

    const nEventsFound = result.nodes.length;
    if (nEventsFound < maxEventsPerQuery) {
      console.log(`All events have been scanned. Last event idx = ${offset + nEventsFound}`);
      process.exit(0);
    }
  }
};

run();
