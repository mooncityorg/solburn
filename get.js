const url = `https://mainnet.helius-rpc.com/?api-key=ff0d3523-6397-47bf-bf5d-acb7d765d5ff`

const data =
{
  "jsonrpc": "2.0",
  "result": [
    {
      "interface": "FungibleToken",
      "id": "5MkEHkvzeQS4D3e7yN4pLXWeLLqQAgQVJ5K894G1Tn6S",
      "content": {
        "$schema": "https://schema.metaplex.com/nft1.0.json",
        "json_uri": "https://stablebonds.s3.us-west-2.amazonaws.com/24-01-01/promo-spl-reporto-7.json",
        "files": [
          {
            "uri": "https://stablebonds.s3.us-west-2.amazonaws.com/24-01-01/promo-spl-reporto-7.png",
            "cdn_uri": "https://cdn.helius-rpc.com/cdn-cgi/image//https://stablebonds.s3.us-west-2.amazonaws.com/24-01-01/promo-spl-reporto-7.png",
            "mime": "image/png"
          }
        ],
        "metadata": {
          "attributes": [
            {
              "value": "2024-01-09",
              "trait_type": "Maturity Date"
            },
            {
              "value": "11%",
              "trait_type": "APY"
            },
            {
              "value": "Reporto",
              "trait_type": "Bond Type"
            },
            {
              "value": "Mexico",
              "trait_type": "Country"
            }
          ],
          "description": "A Reporto is a Cetes traded in the secondary market for a shorter maturity date. Cetes stands for Certificates of the Treasury of the Federation. These are financial instruments denominated in Mexican pesos and are issued by the Mexican government. The profit earned by the holder of CETES is equal to the price difference between acquisition and the nominal value upon maturity. CETES are issued with varying terms, typically around one month (usually 28 days), three months (typically 91 days), six months, and one year. These CETES Stablebonds are composable, self custody, and backed by a real world CETES with the same characteristics.",
          "name": "Etherfuse Reporto 7",
          "symbol": "REPORTO7",
          "token_standard": "Fungible"
        },
        "links": {
          "image": "https://stablebonds.s3.us-west-2.amazonaws.com/24-01-01/promo-spl-reporto-7.png",
          "external_url": "stablebonds.etherfuse.com"
        }
      },
      "authorities": [
        {
          "address": "7aTRyPKcsob85ermncSmvSJfaaAtEe2s8JXwC8f4oGQm",
          "scopes": [
            "full"
          ]
        }
      ],
      "compression": {
        "eligible": false,
        "compressed": false,
        "data_hash": "",
        "creator_hash": "",
        "asset_hash": "",
        "tree": "",
        "seq": 0,
        "leaf_id": 0
      },
      "grouping": [],
      "royalty": {
        "royalty_model": "creators",
        "target": null,
        "percent": 0.0,
        "basis_points": 0,
        "primary_sale_happened": false,
        "locked": false
      },
      "creators": [],
      "ownership": {
        "frozen": false,
        "delegated": false,
        "delegate": null,
        "ownership_model": "token",
        "owner": ""
      },
      "supply": null,
      "mutable": true,
      "burnt": false,
      "token_info": {
        "supply": 4802000000,
        "decimals": 6,
        "token_program": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "mint_authority": "7aTRyPKcsob85ermncSmvSJfaaAtEe2s8JXwC8f4oGQm",
        "freeze_authority": "7aTRyPKcsob85ermncSmvSJfaaAtEe2s8JXwC8f4oGQm"
      }
    }
  ],
  "id": "my-id"
}
const getAssetBatch = async () => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'my-id',
      method: 'getAssetBatch',
      params: {
        ids: [
          '5MkEHkvzeQS4D3e7yN4pLXWeLLqQAgQVJ5K894G1Tn6S'
        ]
      },
    }),
  });
  const { result } = await response.json();
  console.log("Name: ", data.result[0].content.metadata.name);
  console.log("Symbol: ", data.result[0].content.metadata.symbol);
  console.log("Logo: ", data.result[0].content.links.image);
};
getAssetBatch();