import Cookies from 'js-cookie';

export function storeTokenInCookie(token:string){
  Cookies.set('token', token, {expires: 1/48});
}

export function fetchCookieToken():string|undefined{
  return Cookies.get('token');
}

export function storeInCookie(key:string, value:string){
  Cookies.set(key, value, {expires: 1/48});
}

export function fetchFromCookie(key:string):string|undefined{
  return Cookies.get(key);
}

export function deleteCookies(){
  Cookies.remove('token');
  Cookies.remove('username');
}