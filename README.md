# Stipendium

Stipendium is a payment module based on the solana blockchain

BUYER GUIDE :
- Choose pay with cryptos (Stipendium)
- A public address, the amount to send, the name and contract of the currency and the time remaining to
complete the transaction is displayed on the page
- You have 1 hour to send the amount of the currency to the public address.
- The page is updated every 2 seconds
- If during this hour the total amount is received, the payment will be successfull and your order sent to
the merchand
- If after 1 hour the total amount is not sent, the amount received will be sent back minus the transaction fee


MERCHAND GUIDE :
- Install the Stipendium module on your website
- Insert your public personnal wallet address in the "my wallet address" field
- Send at least 0,00002

ALGORITHM PROCESS :

When a payment is requested, a new public key derivated from the private key of
the hot wallet is created. This public key is unique for each payment.
The customer is then asked to process to the payment from his personal wallet to this
public address.

This adress is monitored buy stipendium for a maximum of 1 hour :

- if 100% of the desired amount in SOL is received within this hour, the completion of
the payment is automatically sent to the customer and the order sent to the merchand

- if some amount are received but the amount is less than the required amount then
the customer has the time remaining to complete the payment by sending the difference
of the desired amount minus what has already been send. After 1 hour if the total amount
is not received, the transaction fails, the order is canceled and the amount received
is sent back to the customer public address minus the amount required for the transaction fees.
If the total amount is received within this hour the transaction is complete and the order is
sent to the merchand.

- After 1 hour the public address of the transaction is destroyed automatically, all
the funds sent after this time will be lost forever.

When the transaction is complete, the amount minus the transaction fee is automatically and instantly sent to the merchand public address.
The private key of the merchand wallet is and will never be asked by Stipendium.

