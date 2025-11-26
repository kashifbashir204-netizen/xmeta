import * as xummPkg from 'xumm';
console.log('Keys:', Object.keys(xummPkg));
try {
    console.log('Default:', xummPkg.default);
} catch (e) { }
try {
    console.log('Xumm:', xummPkg.Xumm);
} catch (e) { }
