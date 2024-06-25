const BASE_URL =
  'https://43da-2404-8000-1001-95bb-d886-6ada-a1a0-b121.ngrok-free.app/api/v1';
const FREEZE_URL = `${BASE_URL}/scheduler.freeze`;
const ROLLBACK_URL = `${BASE_URL}/scheduler.rollback`;
const DETACH_PROD_URL = `${BASE_URL}/scheduler.detach-assignment-user-request`;
const API_KEY = '1234567890';

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'x-api-key': API_KEY,
};

const freeze = async (event) => {
  const res = await fetch(FREEZE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: event['name'] }),
  });

  const json = await res.json();

  return json;
};

const rollback = async (event) => {
  const res = await fetch(ROLLBACK_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: event['name'] }),
  });

  const json = await res.json();

  return json;
};

const detachProd = async (event) => {
  const id = event['id'];
  const res = await fetch(`${DETACH_PROD_URL}?id=${id}`, {
    method: 'POST',
    headers,
  });

  const json = await res.json();

  return json;
};

const ACTION_FUNCTION = {
  FREEZE: freeze,
  ROLLBACK: rollback,
  DETACH_PROD: detachProd,
};

export const handler = async (event) => {
  const action = event['action'];

  const func = ACTION_FUNCTION[action];

  if (!func) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Action is unknown' }),
    };
  }

  await func(event);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `${action} run successfully` }),
  };
};
