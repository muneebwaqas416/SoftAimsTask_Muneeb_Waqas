export async function clientApiFetch(endpoint:string, {body, ...customConfig}:any){
  const headers = {'Content-Type': 'application/json'}
  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  }
  if (body) {
    config.body = JSON.stringify(body)
  }
  
  return window.fetch(endpoint, config).then(
    async response => {
      // if (response.ok) {
      return await response.json()
      // } else {
      //   const errorMessage = await response.text()
      //   return Promise.reject(new Error(errorMessage)).then(() => errorMessage)
      }
  ).catch((error) => {
    console.log(error);
  })
}