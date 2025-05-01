export function checkValidPassword(password: string) {
  const numberRegex = new RegExp("[0-9]+");
  const letterRegex = new RegExp("[A-Za-z]+");
  const specialSymbolRegex = new RegExp("[^A-Za-z0-9]+");

  if (
    password.length < 8 ||
    !numberRegex.test(password) ||
    !letterRegex.test(password) ||
    !specialSymbolRegex.test(password)
  ) {
    return false;
  } else {
    return true;
  }
}
