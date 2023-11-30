import database from '../../../../infra/database.js'

async function status( request, response ) {
  const result = await database.query( 'Select 1  + 2' )
  console.log( 'Radames get', result );
  response.status( 200 ).json( { chave: "Radamés Deus" } )
}

export default status