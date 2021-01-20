interface Form {
  name: string;
  email: string;
  subject: string;
  details: string;
}

let config: any = {API_URL: undefined};
async function fetchConfig(url = 'config.json') {
  if(!config.API_URL) {
      try {
          const response = await fetch(url);
          config = await response.json();
          console.debug("(Loading config.json) config.json content = ", config);
          return config;
        } catch (e) {
          console.error(`error loading json ${e}`);
        }
  } else {
      return config;
  } 
}

export async function submitForm(form: Form) {
  const API_URL = (await fetchConfig()).API_URL;
  return fetch(`${API_URL}feedback`, {
    method: 'POST',
    body: JSON.stringify(form)
  });
}
