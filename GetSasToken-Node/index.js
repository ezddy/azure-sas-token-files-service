var azure = require('azure-storage');

module.exports = function(context, req) {
    if (req.body.share) {
        context.res = generateSasToken(context, req.body.share);
    } else {
        context.res = {
            status: 400,
            body: "Entrez le nom du dossier de partage'"
        };
    }
    
    context.done();
};

function generateSasToken(context, share) {
    var connString = process.env.AzureWebJobsStorage;
    var fileService = azure.createFileService(connString);

    // Creation d'un token qui expire au bout d'une heure
    // Debut du token : T - 5 minutes pour éviter les decalages d'horloge
    var startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 5);
    var expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 60);

    // The following values can be used for permissions: 
    // "a" (Add), "r" (Read), "w" (Write), "d" (Delete), "l" (List)
    // Concatenate multiple permissions, such as "rwa" = Read, Write, Add
    var permissions = "rl" 

    var sharedAccessPolicy = {
        AccessPolicy: {
            Permissions: permissions,
            Start: startDate,
            Expiry: expiryDate,
            Protocols: "https"
        }
    };
    
    var sasToken = fileService.generateSharedAccessSignature(share, "testdir", undefined, sharedAccessPolicy, undefined);
    
    return {
        token: sasToken
    };
}
