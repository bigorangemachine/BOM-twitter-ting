var config={};
config.db = {'type':'mysql','user':'youruser','pass':'yourpass','host':'localhost','db':'yourdb','version':'5.6'
    //,'doc_root':'/your/path/to/project-name'//pm2 no cwd - if you use cwd you might need to specify your root
};

config.API={
    'endpoint':'https://api.twitter.com/1.1/',
    'api_key':'YOUR-API-KEY',
    'secret': 'YOUR-API-SECRET',
    'access_token':'YOUR-API-ACCESS-TOKEN',
    'access_secret':'YOUR-API-ACCESS-SECRET',
    'account_num':'88888'
};
config.local_cache='_cache/';
module.exports = config;
