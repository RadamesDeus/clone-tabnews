const { exec } = require( "node:child_process" );

async function checkPostgres() {
  exec( "docker exec postgres-dev pg_isready -h localhost", handleCallback );

  function handleCallback( err, out ) {
    if ( out.search( "accepting connections" ) === -1 ) {
      process.stdout.write( "." )
      checkPostgres();
      return;
    }
    console.log( "end\n\🟢 O Postgres já aceita conexões\n" );
  }
}

process.stdout.write( "\n\n🔴 Aguardando o postgres aceitar conexões..." );
checkPostgres();