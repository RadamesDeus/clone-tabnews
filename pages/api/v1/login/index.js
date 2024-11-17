
async function login( request, response ) {

  const url = "https://www.dimepkairos.com.br/Dimep/Account/LogOn";
  const usuario = "radames.bastos@dealernet.com.br"; // Substitua pelo valor do usuário
  const senha = "hard1042,"; // Substitua pela senha

  const dados = new URLSearchParams();
  dados.append( "LogOnModel.UserName", usuario );
  dados.append( "LogOnModel.Password", senha );
  // dados.append("LogOnModel.Ip", ip); // Caso precise incluir o IP, descomente essa linha

  // Fazendo a requisição POST com fetch
  const result = await fetch( url, {
    method: "POST",
    body: dados,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  } )
    .then( response => response.text() ) // Obtém a resposta como texto
    .then( conteudo => {
      const regex =
        /(?:UrlProfile = '\/Dimep\/Pessoas\/UserProfilePessoas\/)\d+/;
      const foundBody = response.data.match( regex );
      console.log( "Radames" );
      console.log( foundBody ); // Exibe o conteúdo da resposta
      // Verifique o conteúdo para determinar se o login foi bem-sucedido
    } )
    .catch( error => {
      console.error( "Erro na requisição:", error );
    } );


  response.status( 200 ).setHeader( 'Content-Type', 'text/html' );
  response.send( result );


}

export default login