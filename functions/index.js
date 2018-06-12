const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.onReferral = functions.database.ref('/Referral/{referrerAddress}/ips/{ip}').onCreate((ev, ctx) => {

    const PXLReward = 10;

    let updates = {};

    let referrerAddress = ctx.params.referrerAddress;
    let ip = ctx.params.ip;

    let data = ev.val();
    let referreeAddress = data.wallet;

    updates['/Referral/'+referrerAddress+'/ips/'+ip+'/verified'] = true;
    
    return admin.database().ref('/Referral/'+referrerAddress).once('value').then(refStats => {
        return admin.database().ref('/Referrees/ips/'+ip).once('value').then(result => {
            if (!result.exists()) {
                updates['/Referral/'+referrerAddress+'/earned'] = refStats.earned.val() + PXLReward;
                updates['/Referral/'+referrerAddress+'/refers'] = refStats.refers.val() + 1;
                updates['/Referrees/ips/'+ip] = referrerAddress;
            } else {
                updates['/Referral/'+referrerAddress+'/ips/'+ip+'/'+referreeAddress+'/verified'] = 'duplicate IP';
            }
            updates['/Referrees/address/'+referreeAddress] = referrerAddress;
            return admin.database().ref().update(updates);
        });
    });
})