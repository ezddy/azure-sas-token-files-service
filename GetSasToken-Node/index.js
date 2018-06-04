var azure = require('azure-storage');

module.exports = function(context, req) {
    if (req.body.share) {
        context.res = generateSasToken(context, req.body.share, req.body.directory, req.body.permissions);
    } else {
        context.res = {
            status: 400,
            body: "Entrez le nom du dossier de partage'"
        };
    }
    
    context.done();
};

function generateSasToken(context, share, directory, permissions) {
    var connString = process.env.AzureWebJobsStorage;
    var fileService = azure.createFileService(connString);

    // Creation d'un token qui expire au bout d'une heure
    // Debut du token : T - 5 minutes pour éviter les decalages d'horloge
    var startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 5);
    var expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 60);

    // Valeurs possibles pour les permissions: 
    // "a" (Add), "r" (Read), "w" (Write), "d" (Delete), "l" (List)
    // Concatener plusieurs permissions : "rwa" = Read, Write, Add
    permissions = permissions || (azure.FileUtilities.SharedAccessPermissions.READ + azure.FileUtilities.SharedAccessPermissions.LIST); 

    var sharedAccessPolicy = {
        AccessPolicy: {
            Permissions: permissions,
            Start: startDate,
            Expiry: expiryDate,
            Protocols: "https"
        }
    };
    
    var sasToken = fileService.generateSharedAccessSignature(share, directory, undefined, sharedAccessPolicy, undefined);
    var url = fileService.getUrl(share, directory, sasToken);
    return {
        token: sasToken,
        url: url
    };
}
