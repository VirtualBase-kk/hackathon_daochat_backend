const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();
const secretsManager = new AWS.SecretsManager()
const {dbname} = require("../dbname")
const auth = require("../auth")
const { v4:uuidv4 } = require("uuid")
const Web3 = require("web3")
const abi = require("../contract/abi.json")

const bytecode = "0x60806040523480156200001157600080fd5b5060405162002e5238038062002e5283398181016040528101906200003791906200051e565b620000576200004b620000a960201b60201c565b620000b160201b60201c565b80600290805190602001906200006f929190620002d1565b50620000a27fc65b6dc445843af69e7af2fc32667c7d3b98b02602373e2d0a7a047f274806f7336200017560201b60201c565b50620005d3565b600033905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b6200018782826200026660201b60201c565b6200026257600180600084815260200190815260200160002060000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555062000207620000a960201b60201c565b73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45b5050565b60006001600084815260200190815260200160002060000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b828054620002df906200059e565b90600052602060002090601f0160209004810192826200030357600085556200034f565b82601f106200031e57805160ff19168380011785556200034f565b828001600101855582156200034f579182015b828111156200034e57825182559160200191906001019062000331565b5b5090506200035e919062000362565b5090565b5b808211156200037d57600081600090555060010162000363565b5090565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b620003ea826200039f565b810181811067ffffffffffffffff821117156200040c576200040b620003b0565b5b80604052505050565b60006200042162000381565b90506200042f8282620003df565b919050565b600067ffffffffffffffff821115620004525762000451620003b0565b5b6200045d826200039f565b9050602081019050919050565b60005b838110156200048a5780820151818401526020810190506200046d565b838111156200049a576000848401525b50505050565b6000620004b7620004b18462000434565b62000415565b905082815260208101848484011115620004d657620004d56200039a565b5b620004e38482856200046a565b509392505050565b600082601f83011262000503576200050262000395565b5b815162000515848260208601620004a0565b91505092915050565b6000602082840312156200053757620005366200038b565b5b600082015167ffffffffffffffff81111562000558576200055762000390565b5b6200056684828501620004eb565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680620005b757607f821691505b602082108103620005cd57620005cc6200056f565b5b50919050565b61286f80620005e36000396000f3fe608060405234801561001057600080fd5b50600436106101375760003560e01c80638aabfcff116100b8578063a5317ff81161007c578063a5317ff81461033e578063a63651921461036e578063d547741f1461038a578063f2fde38b146103a6578063fe704a9d146103c2578063ff71f6c9146103e057610137565b80638aabfcff146102845780638da5cb5b146102b457806391d14854146102d2578063a217fddf14610302578063a3f4df7e1461032057610137565b80632f2ff15d116100ff5780632f2ff15d146101f257806336568abe1461020e5780634b90f67e1461022a578063506e74f51461025b578063715018a61461027a57610137565b806301ffc9a71461013c57806304f9bdb51461016c5780631a2323d91461018a5780631d5f0449146101a6578063248a9ca3146101c2575b600080fd5b61015660048036038101906101519190611863565b6103fc565b60405161016391906118ab565b60405180910390f35b610174610476565b60405161018191906118df565b60405180910390f35b6101a4600480360381019061019f9190611958565b61049a565b005b6101c060048036038101906101bb9190611958565b6104fa565b005b6101dc60048036038101906101d791906119b1565b610592565b6040516101e991906118df565b60405180910390f35b61020c600480360381019061020791906119de565b6105b2565b005b610228600480360381019061022391906119de565b6105d3565b005b610244600480360381019061023f9190611b9a565b610656565b604051610252929190611dfe565b60405180910390f35b6102636108bb565b604051610271929190611e35565b60405180910390f35b610282610b43565b005b61029e60048036038101906102999190611e6c565b610b57565b6040516102ab9190611ec4565b60405180910390f35b6102bc610b82565b6040516102c99190611eee565b60405180910390f35b6102ec60048036038101906102e791906119de565b610bab565b6040516102f991906118ab565b60405180910390f35b61030a610c16565b60405161031791906118df565b60405180910390f35b610328610c1d565b6040516103359190611f53565b60405180910390f35b61035860048036038101906103539190611e6c565b610cab565b6040516103659190611f75565b60405180910390f35b6103886004803603810190610383919061207d565b610da2565b005b6103a4600480360381019061039f91906119de565b610edb565b005b6103c060048036038101906103bb9190611958565b610efc565b005b6103ca610f7f565b6040516103d79190611f53565b60405180910390f35b6103fa60048036038101906103f591906121e7565b611011565b005b60007f7965db0b000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916148061046f575061046e826110dc565b5b9050919050565b7fc65b6dc445843af69e7af2fc32667c7d3b98b02602373e2d0a7a047f274806f781565b6104c47fc65b6dc445843af69e7af2fc32667c7d3b98b02602373e2d0a7a047f274806f733610bab565b6104cd57600080fd5b6104f77fc65b6dc445843af69e7af2fc32667c7d3b98b02602373e2d0a7a047f274806f782611146565b50565b6105247fc65b6dc445843af69e7af2fc32667c7d3b98b02602373e2d0a7a047f274806f733610bab565b61052d57600080fd5b3373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff160361056557600080fd5b61058f7fc65b6dc445843af69e7af2fc32667c7d3b98b02602373e2d0a7a047f274806f782611226565b50565b600060016000838152602001908152602001600020600101549050919050565b6105bb82610592565b6105c481611308565b6105ce8383611146565b505050565b6105db61131c565b73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614610648576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161063f90612300565b60405180910390fd5b6106528282611226565b5050565b60608060008367ffffffffffffffff81111561067557610674611a39565b5b6040519080825280602002602001820160405280156106a857816020015b60608152602001906001900390816106935790505b50905060008467ffffffffffffffff8111156106c7576106c6611a39565b5b6040519080825280602002602001820160405280156106f55781602001602082028036833780820191505090505b50905060005b60058760405161070b919061235c565b9081526020016040518091039020805490508110156108ab57600587604051610734919061235c565b9081526020016040518091039020818154811061075457610753612373565b5b906000526020600020018054610769906123d1565b80601f0160208091040260200160405190810160405280929190818152602001828054610795906123d1565b80156107e25780601f106107b7576101008083540402835291602001916107e2565b820191906000526020600020905b8154815290600101906020018083116107c557829003601f168201915b50505050508382815181106107fa576107f9612373565b5b6020026020010181905250600687604051610815919061235c565b9081526020016040518091039020600588604051610833919061235c565b9081526020016040518091039020828154811061085357610852612373565b5b9060005260206000200160405161086a9190612496565b90815260200160405180910390205482828151811061088c5761088b612373565b5b60200260200101818152505080806108a3906124dc565b9150506106fb565b5081819350935050509250929050565b606080600060038054905067ffffffffffffffff8111156108df576108de611a39565b5b60405190808252806020026020018201604052801561091257816020015b60608152602001906001900390816108fd5790505b509050600060038054905067ffffffffffffffff81111561093657610935611a39565b5b60405190808252806020026020018201604052801561096957816020015b60608152602001906001900390816109545790505b50905060005b600380549050811015610b3657600381815481106109905761098f612373565b5b9060005260206000200180546109a5906123d1565b80601f01602080910402602001604051908101604052809291908181526020018280546109d1906123d1565b8015610a1e5780601f106109f357610100808354040283529160200191610a1e565b820191906000526020600020905b815481529060010190602001808311610a0157829003601f168201915b5050505050838281518110610a3657610a35612373565b5b6020026020010181905250600460038281548110610a5757610a56612373565b5b90600052602060002001604051610a6e9190612496565b90815260200160405180910390208054610a87906123d1565b80601f0160208091040260200160405190810160405280929190818152602001828054610ab3906123d1565b8015610b005780601f10610ad557610100808354040283529160200191610b00565b820191906000526020600020905b815481529060010190602001808311610ae357829003601f168201915b5050505050828281518110610b1857610b17612373565b5b60200260200101819052508080610b2e906124dc565b91505061096f565b5081819350935050509091565b610b4b611324565b610b5560006113a2565b565b6000600582604051610b69919061235c565b9081526020016040518091039020805490509050919050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60006001600084815260200190815260200160002060000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b6000801b81565b60028054610c2a906123d1565b80601f0160208091040260200160405190810160405280929190818152602001828054610c56906123d1565b8015610ca35780601f10610c7857610100808354040283529160200191610ca3565b820191906000526020600020905b815481529060010190602001808311610c8657829003601f168201915b505050505081565b6060600582604051610cbd919061235c565b9081526020016040518091039020805480602002602001604051908101604052809291908181526020016000905b82821015610d97578382906000526020600020018054610d0a906123d1565b80601f0160208091040260200160405190810160405280929190818152602001828054610d36906123d1565b8015610d835780601f10610d5857610100808354040283529160200191610d83565b820191906000526020600020905b815481529060010190602001808311610d6657829003601f168201915b505050505081526020019060010190610ceb565b505050509050919050565b610dcc7fc65b6dc445843af69e7af2fc32667c7d3b98b02602373e2d0a7a047f274806f733610bab565b610dd557600080fd5b600383908060018154018082558091505060019003906000526020600020016000909190919091509080519060200190610e10929190611754565b5081600484604051610e22919061235c565b90815260200160405180910390209080519060200190610e43929190611754565b5060005b8151811015610ed557600584604051610e60919061235c565b9081526020016040518091039020828281518110610e8157610e80612373565b5b6020026020010151908060018154018082558091505060019003906000526020600020016000909190919091509080519060200190610ec1929190611754565b508080610ecd906124dc565b915050610e47565b50505050565b610ee482610592565b610eed81611308565b610ef78383611226565b505050565b610f04611324565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610f73576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f6a90612596565b60405180910390fd5b610f7c816113a2565b50565b606060028054610f8e906123d1565b80601f0160208091040260200160405190810160405280929190818152602001828054610fba906123d1565b80156110075780601f10610fdc57610100808354040283529160200191611007565b820191906000526020600020905b815481529060010190602001808311610fea57829003601f168201915b5050505050905090565b61103b7fc65b6dc445843af69e7af2fc32667c7d3b98b02602373e2d0a7a047f274806f733610bab565b61104457600080fd5b60005b82518110156110d65781818151811061106357611062612373565b5b602002602001015160068560405161107b919061235c565b908152602001604051809103902084838151811061109c5761109b612373565b5b60200260200101516040516110b1919061235c565b90815260200160405180910390208190555080806110ce906124dc565b915050611047565b50505050565b60007f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149050919050565b6111508282610bab565b61122257600180600084815260200190815260200160002060000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055506111c761131c565b73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45b5050565b6112308282610bab565b156113045760006001600084815260200190815260200160002060000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055506112a961131c565b73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16837ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b60405160405180910390a45b5050565b6113198161131461131c565b611466565b50565b600033905090565b61132c61131c565b73ffffffffffffffffffffffffffffffffffffffff1661134a610b82565b73ffffffffffffffffffffffffffffffffffffffff16146113a0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161139790612602565b60405180910390fd5b565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b6114708282610bab565b6114e75761147d816114eb565b61148b8360001c6020611518565b60405160200161149c9291906126ba565b6040516020818303038152906040526040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016114de9190611f53565b60405180910390fd5b5050565b60606115118273ffffffffffffffffffffffffffffffffffffffff16601460ff16611518565b9050919050565b60606000600283600261152b91906126f4565b611535919061274e565b67ffffffffffffffff81111561154e5761154d611a39565b5b6040519080825280601f01601f1916602001820160405280156115805781602001600182028036833780820191505090505b5090507f3000000000000000000000000000000000000000000000000000000000000000816000815181106115b8576115b7612373565b5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053507f78000000000000000000000000000000000000000000000000000000000000008160018151811061161c5761161b612373565b5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053506000600184600261165c91906126f4565b611666919061274e565b90505b6001811115611706577f3031323334353637383961626364656600000000000000000000000000000000600f8616601081106116a8576116a7612373565b5b1a60f81b8282815181106116bf576116be612373565b5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600485901c9450806116ff906127a4565b9050611669565b506000841461174a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161174190612819565b60405180910390fd5b8091505092915050565b828054611760906123d1565b90600052602060002090601f01602090048101928261178257600085556117c9565b82601f1061179b57805160ff19168380011785556117c9565b828001600101855582156117c9579182015b828111156117c85782518255916020019190600101906117ad565b5b5090506117d691906117da565b5090565b5b808211156117f35760008160009055506001016117db565b5090565b6000604051905090565b600080fd5b600080fd5b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b6118408161180b565b811461184b57600080fd5b50565b60008135905061185d81611837565b92915050565b60006020828403121561187957611878611801565b5b60006118878482850161184e565b91505092915050565b60008115159050919050565b6118a581611890565b82525050565b60006020820190506118c0600083018461189c565b92915050565b6000819050919050565b6118d9816118c6565b82525050565b60006020820190506118f460008301846118d0565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000611925826118fa565b9050919050565b6119358161191a565b811461194057600080fd5b50565b6000813590506119528161192c565b92915050565b60006020828403121561196e5761196d611801565b5b600061197c84828501611943565b91505092915050565b61198e816118c6565b811461199957600080fd5b50565b6000813590506119ab81611985565b92915050565b6000602082840312156119c7576119c6611801565b5b60006119d58482850161199c565b91505092915050565b600080604083850312156119f5576119f4611801565b5b6000611a038582860161199c565b9250506020611a1485828601611943565b9150509250929050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b611a7182611a28565b810181811067ffffffffffffffff82111715611a9057611a8f611a39565b5b80604052505050565b6000611aa36117f7565b9050611aaf8282611a68565b919050565b600067ffffffffffffffff821115611acf57611ace611a39565b5b611ad882611a28565b9050602081019050919050565b82818337600083830152505050565b6000611b07611b0284611ab4565b611a99565b905082815260208101848484011115611b2357611b22611a23565b5b611b2e848285611ae5565b509392505050565b600082601f830112611b4b57611b4a611a1e565b5b8135611b5b848260208601611af4565b91505092915050565b6000819050919050565b611b7781611b64565b8114611b8257600080fd5b50565b600081359050611b9481611b6e565b92915050565b60008060408385031215611bb157611bb0611801565b5b600083013567ffffffffffffffff811115611bcf57611bce611806565b5b611bdb85828601611b36565b9250506020611bec85828601611b85565b9150509250929050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b600081519050919050565b600082825260208201905092915050565b60005b83811015611c5c578082015181840152602081019050611c41565b83811115611c6b576000848401525b50505050565b6000611c7c82611c22565b611c868185611c2d565b9350611c96818560208601611c3e565b611c9f81611a28565b840191505092915050565b6000611cb68383611c71565b905092915050565b6000602082019050919050565b6000611cd682611bf6565b611ce08185611c01565b935083602082028501611cf285611c12565b8060005b85811015611d2e5784840389528151611d0f8582611caa565b9450611d1a83611cbe565b925060208a01995050600181019050611cf6565b50829750879550505050505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b611d7581611b64565b82525050565b6000611d878383611d6c565b60208301905092915050565b6000602082019050919050565b6000611dab82611d40565b611db58185611d4b565b9350611dc083611d5c565b8060005b83811015611df1578151611dd88882611d7b565b9750611de383611d93565b925050600181019050611dc4565b5085935050505092915050565b60006040820190508181036000830152611e188185611ccb565b90508181036020830152611e2c8184611da0565b90509392505050565b60006040820190508181036000830152611e4f8185611ccb565b90508181036020830152611e638184611ccb565b90509392505050565b600060208284031215611e8257611e81611801565b5b600082013567ffffffffffffffff811115611ea057611e9f611806565b5b611eac84828501611b36565b91505092915050565b611ebe81611b64565b82525050565b6000602082019050611ed96000830184611eb5565b92915050565b611ee88161191a565b82525050565b6000602082019050611f036000830184611edf565b92915050565b600082825260208201905092915050565b6000611f2582611c22565b611f2f8185611f09565b9350611f3f818560208601611c3e565b611f4881611a28565b840191505092915050565b60006020820190508181036000830152611f6d8184611f1a565b905092915050565b60006020820190508181036000830152611f8f8184611ccb565b905092915050565b600067ffffffffffffffff821115611fb257611fb1611a39565b5b602082029050602081019050919050565b600080fd5b6000611fdb611fd684611f97565b611a99565b90508083825260208201905060208402830185811115611ffe57611ffd611fc3565b5b835b8181101561204557803567ffffffffffffffff81111561202357612022611a1e565b5b8086016120308982611b36565b85526020850194505050602081019050612000565b5050509392505050565b600082601f83011261206457612063611a1e565b5b8135612074848260208601611fc8565b91505092915050565b60008060006060848603121561209657612095611801565b5b600084013567ffffffffffffffff8111156120b4576120b3611806565b5b6120c086828701611b36565b935050602084013567ffffffffffffffff8111156120e1576120e0611806565b5b6120ed86828701611b36565b925050604084013567ffffffffffffffff81111561210e5761210d611806565b5b61211a8682870161204f565b9150509250925092565b600067ffffffffffffffff82111561213f5761213e611a39565b5b602082029050602081019050919050565b600061216361215e84612124565b611a99565b9050808382526020820190506020840283018581111561218657612185611fc3565b5b835b818110156121af578061219b8882611b85565b845260208401935050602081019050612188565b5050509392505050565b600082601f8301126121ce576121cd611a1e565b5b81356121de848260208601612150565b91505092915050565b600080600060608486031215612200576121ff611801565b5b600084013567ffffffffffffffff81111561221e5761221d611806565b5b61222a86828701611b36565b935050602084013567ffffffffffffffff81111561224b5761224a611806565b5b6122578682870161204f565b925050604084013567ffffffffffffffff81111561227857612277611806565b5b612284868287016121b9565b9150509250925092565b7f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560008201527f20726f6c657320666f722073656c660000000000000000000000000000000000602082015250565b60006122ea602f83611f09565b91506122f58261228e565b604082019050919050565b60006020820190508181036000830152612319816122dd565b9050919050565b600081905092915050565b600061233682611c22565b6123408185612320565b9350612350818560208601611c3e565b80840191505092915050565b6000612368828461232b565b915081905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806123e957607f821691505b6020821081036123fc576123fb6123a2565b5b50919050565b60008190508160005260206000209050919050565b60008154612424816123d1565b61242e8186612320565b94506001821660008114612449576001811461245a5761248d565b60ff1983168652818601935061248d565b61246385612402565b60005b8381101561248557815481890152600182019150602081019050612466565b838801955050505b50505092915050565b60006124a28284612417565b915081905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006124e782611b64565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203612519576125186124ad565b5b600182019050919050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b6000612580602683611f09565b915061258b82612524565b604082019050919050565b600060208201905081810360008301526125af81612573565b9050919050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b60006125ec602083611f09565b91506125f7826125b6565b602082019050919050565b6000602082019050818103600083015261261b816125df565b9050919050565b7f416363657373436f6e74726f6c3a206163636f756e7420000000000000000000600082015250565b6000612658601783612320565b915061266382612622565b601782019050919050565b7f206973206d697373696e6720726f6c6520000000000000000000000000000000600082015250565b60006126a4601183612320565b91506126af8261266e565b601182019050919050565b60006126c58261264b565b91506126d1828561232b565b91506126dc82612697565b91506126e8828461232b565b91508190509392505050565b60006126ff82611b64565b915061270a83611b64565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615612743576127426124ad565b5b828202905092915050565b600061275982611b64565b915061276483611b64565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115612799576127986124ad565b5b828201905092915050565b60006127af82611b64565b9150600082036127c2576127c16124ad565b5b600182039050919050565b7f537472696e67733a20686578206c656e67746820696e73756666696369656e74600082015250565b6000612803602083611f09565b915061280e826127cd565b602082019050919050565b60006020820190508181036000830152612832816127f6565b905091905056fea2646970667358221220cdb0a44034e845ad51261d412525d301c912aac2f56adf3012d6c9fa605e3b7964736f6c634300080d0033"

/*
    プロジェクトを作成
    リクエスト：
    {
        name: string
    }
    レスポンス：
    {
        id: string
        bin: string
    }
*/
router.post("/admin/create",async (req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
        const id = uuidv4()
        const putItemInput = {
            TableName: dbname["Organization"],
            Item:{
                id:id,
                name:req.body["name"],
                ownerId: authResp.user["cognito:username"]
            }
        }
        try {
            await documentClient.put(putItemInput).promise()
            const web3 = new Web3()
            const contract = new web3.eth.Contract(abi)
            const deployObj = contract.deploy({
                data:bytecode,
                arguments:[req.body["name"]]
            })
            res.json({
                id: id,
                bin: deployObj.encodeABI()
            })
        } catch {
            res.status(500).json({
                status:false
            })
        }
    } else {
        res.status(401).json({
            status:false
        })
    }
})

/*
    コントラクトアドレスを設定
    リクエスト：
    {
        id: string
        contractAddress: string
    }
*/
router.post("/admin/setContract",async (req,res) =>{
    const authResp = await auth(req)
    if (authResp.status) {
        const getDatabaseParam = {
            TableName: dbname["Organization"],
            Key:{
                id:req.body["id"]
            }
        }
        const resp = await documentClient.get(getDatabaseParam).promise()
        if (resp.Item.ownerId !== authResp.user["cognito:username"]) {
            res.status(400).json({
                status:false
            })
            return
        }
        const updateDatabaseParam = {
            TableName: dbname["Organization"],
            Key:{
                id: req.body["id"]
            },
            UpdateExpression: "set #contractAddress=:contractAddress",
            ExpressionAttributeNames: {
                "#contractAddress": "contractAddress",
            },
            ExpressionAttributeValues: {
                ":contractAddress": req.body["contractAddress"],
            },
        }
        await documentClient.update(updateDatabaseParam).promise()
        const putMemberParam = {
            TableName: dbname["Member"],
            Item:{
                id: uuidv4(),
                userId: authResp.user["cognito:username"],
                organizationId: req.body["id"]
            }
        }
        await documentClient.put(putMemberParam).promise()
        res.json({
            status:false
        })
    } else {
        res.status(401).json({
            status:false
        })
    }
})

/*
    組織へユーザーを追加
    リクエスト：
    {
        id: string
        walletAddress: string
    }
*/
router.post("/admin/user",async (req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
        const getDatabaseParam = {
            TableName: dbname["Organization"],
            Key:{
                id:req.body["id"]
            }
        }
        const resp = await documentClient.get(getDatabaseParam).promise()
        if (resp.Item.ownerId !== authResp.user["cognito:username"]) {
            res.status(400).json({
                status:false
            })
            return
        }
        const queryUserParam = {
            TableName: dbname["User"],
            IndexName: "evmAddress-index",
            ExpressionAttributeNames:{
                "#evmAddress":"evmAddress"
            },
            ExpressionAttributeValues:{
                ":evmAddress":req.body["walletAddress"].toUpperCase()
            },
            KeyConditionExpression: "#evmAddress = :evmAddress"
        }
        const quryUserResp = await documentClient.query(queryUserParam).promise()
        if (quryUserResp.Count === 0) {
            res.status(404).json({
                status:false,
            })
            return
        }
        const putMemberInput = {
            TableName: dbname["Member"],
            Item: {
                id:uuidv4(),
                userId:quryUserResp.Items[0].id,
                organizationId:req.body["id"]
            }
        }
        await documentClient.put(putMemberInput).promise()
        res.json({
            status:false
        })
    } else {
        res.status(401).json({
            status:false
        })
    }
})


/*
    組織の情報を取得
    リクエストパラメータ：
    {
        id: string
    }
    レスポンス:
    {
        contractAddress: string
        name: string
    }
*/
router.get("/organization",async (req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
        const getDatabaseParam = {
            TableName: dbname["Organization"],
            Key:{
                id:req.query["id"]
            }
        }
        const resp = await documentClient.get(getDatabaseParam).promise()
        res.json({
            contractAddress:resp.Item["contractAddress"],
            name: resp.Item["name"]
        })
    } else {
        res.status(401).json({
            status:false
        })
    }
})

/*
    コントラクトにロールを付与
    リクエストパラメータ：
    {
        id: string,
        walletAddress: string
    }
    レスポンス:
    {
        message: string,
        contractAddress: string
    }
*/
router.get("/contract/role",async (req,res)=>{
    const authResp = await auth(req)
    if (authResp.status) {
        const getDatabaseParam = {
            TableName: dbname["Organization"],
            Key:{
                id:req.query["id"]
            }
        }
        const resp = await documentClient.get(getDatabaseParam).promise()
        const web3 = new Web3()
        const contract = new web3.eth.Contract(abi,resp.Item.contractAddress)
        const message = contract.methods.AddMember(req.query["walletAddress"]).encodeABI()
        res.json({
            message:message,
//            contractAddress: resp.Item.contractAddress
        })
    } else {
        res.status(401).json({
            status:false
        })
    }
})

module.exports = router