test( "GET to /api/v1/staus/ should return 200", async () => {
  const response = await fetch( "http://localhost:3000" )

  expect( response.status ).toBe( 200 )
} )