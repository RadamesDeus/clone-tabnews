test( "GET to /api/v1/status should return 200", async () => {
  const response = await fetch( "http://localhost:3000/api/v1/status" )
  expect( response.status ).toBe( 200 )

  const bodyResponse = await response.json()
  expect( bodyResponse.update_at ).toBeDefined();

  const parsedUpdateAt = new Date( bodyResponse.update_at ).toISOString()
  expect( bodyResponse.update_at ).toEqual( parsedUpdateAt )
  expect( bodyResponse.dependencies.database.version ).toEqual( '16.1' )
  expect( bodyResponse.dependencies.database.max_connections ).toEqual( 100 )
  expect( bodyResponse.dependencies.database.opened_connections ).toEqual( 1 )

} )

