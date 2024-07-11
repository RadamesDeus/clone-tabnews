import { Client } from 'pg'

async function query( queryObject ) {
  const client = new Client( {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  } );
  await client.connect();
  let query;
  try {
    query = await client.query( queryObject )
    await client.end();
  } catch ( error ) {

  } finally {
    await client.end();
  }
  return query;


}

export default {
  query
}