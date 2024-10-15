import migrationRunner from "node-pg-migrate"
import { join } from "path"
import database from "infra/database"

export default async function migrations( request, response ) {
  console.log( request.method );


  if ( request.method != "GET" && request.method != "POST" ) {
    return response.status( 405 ).json( { error: `Method ${request.method} Not Allowed` } )
  }
  const dbClient = await database.getNewClient();

  try {
    console.log( "INICIO start", new Date().toString() );

    const configOptions = {
      dbClient,
      dryRun: true,
      dir: join( "infra", "migrations" ),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations"
    }

    if ( request.method === "GET" ) {
      const pendingMigrations = await migrationRunner( configOptions )
      return response.status( 200 ).json( pendingMigrations )
    }

    if ( request.method === "POST" ) {

      const migratedMigrations = await migrationRunner( {
        ...configOptions,
        dryRun: false,
      } )
      return response.status( migratedMigrations.length > 0 ? 201 : 200 ).json( migratedMigrations )
    }
  } catch ( error ) {
    console.error( error );
    throw error;
  } finally {
    console.log( "FIM END", new Date().toString() );
    dbClient.end();
  }



}

