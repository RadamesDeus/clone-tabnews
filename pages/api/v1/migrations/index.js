import migrationRunner from "node-pg-migrate"
import { join } from "path"
import database from "infra/database"

export default async function migrations( request, response ) {
  const dbClient = await database.getNewClient();
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
    dbClient.end();
    return response.status( 200 ).json( pendingMigrations )
  }

  if ( request.method === "POST" ) {
    const migratedMigrations = await migrationRunner( {
      ...configOptions,
      dryRun: false,
    } )
    dbClient.end();
    return response.status( migratedMigrations.length > 0 ? 201 : 200 ).json( migratedMigrations )
  }

  return response.status( 405 )


}

