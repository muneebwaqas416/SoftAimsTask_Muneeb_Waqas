import Cookies from 'js-cookie';

export function storeTokenInCookie(token:string){
  Cookies.set('token', token);
}

export function fetchCookieToken():string|undefined{
  return Cookies.get('token');
}

export function storeInCookie(key:string, value:string){
  Cookies.set(key, value);
}

export function fetchFromCookie(key:string):string|undefined{
  return Cookies.get(key);
}

export function deleteCookies() {
  Cookies.remove('token');
  Cookies.remove('username');
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  return Promise.resolve();
}