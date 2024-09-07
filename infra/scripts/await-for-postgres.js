const { exec } = require( "node:child_process" );

function checkPostgres() {
  exec( "docker exec postgres-dev pg_isready --host localhost", handleCallback );

  function handleCallback( err, out ) {
    if ( out.search( "accepting connections" ) === -1 ) {
      process.stdout.write( "." )
      checkPostgres();
      return;
    }
    console.log( "end\n\\0/ O postgres já aceita conexões\n" );
  }
}

process.stdout.write( "\n\n:) Aguardando o postgres aceitar conexões..." );
checkPostgres();