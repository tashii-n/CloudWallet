// /lib/data/faqData.ts

export interface FAQItem {
  question: string;
  answer: string;
}

const faqData = {
  users: [
    {
      question: `I am not able to receive my Foundational ID with the error message, "Foundational ID will be issued to you shortly." What should I do?`,
      answer: `Bhutan NDI validates the time when the request for Foundational ID has been submitted. Therefore, it is important to have the time accurately set on your smartphone device. Users are advised to switch their Time feature to "automatic" under the phone's Settings. After users set their device time to "automatic", they will have to reinstall the app and complete the onboarding process.`,
    },
    {
      question: `What is Bhutan NDI?`,
      answer: `Bhutan NDI is a mobile wallet that holds your personal credentials which can be used to prove your identity and share your credentials while accessing government and business services online. These credentials include, but are not limited to, Foundational Identities such as name, citizenship ID, household and Functional Identities such as Thram numbers, bank account details, education certificates and more.`,
    },
    {
      question: `Am I eligible to register on/use Bhutan NDI?`,
      answer: `All Bhutanese nationals as well as residents and visitors of Bhutan who have submitted their personal information and biometrics to either Department of Civil Registration and Census (DCRC) or Department of Immigration (DoI) are eligible to register on and use the Bhutan NDI wallet.`,
    },
    {
      question: `What personal information/documents do I need to register for Bhutan NDI?`,
      answer: `You need to submit your basic information available on your CID card/passport/work permit like name, date of birth, citizenship ID, permanent address, and biometrics to successfully register on Bhutan NDI.`,
    },
    {
      question: `How can I get my Foundational ID?`,
      answer: `After downloading the Bhutan NDI app from App Store/Google Play, submit your personal details to authenticate yourself. Make sure that all the information you submit during onboarding is accurate and match the details maintained by the Royal Government of Bhutan (RGOB). Once completed, your Foundational ID will be automatically issued to you by the Department of Civil Registration and Census (Bhutanese national) or Department of Immigration (foreign nationals).`,
    },
    {
      question: `My onboarding is not successful. What should I do?`,
      answer: `Ensure that all the information you submit is accurate and up to date and retry the onboarding process. If you continue to face a problem, contact the toll-free NDI support helpline at 1199.`,
    },
    {
      question: `My facial biometric is not a match. What should I do?`,
      answer: `You can proceed with the Face ID authentication only if you have submitted your biometrics to RGOB. If you have submitted your biometrics, follow the instruction to complete the liveness detection test by moving your face from side-to-side and top-to-bottom during Face ID authentication. If you continue to face a problem, contact toll-free NDI support helpline at 1199.`,
    },
    {
      question: `I have completed my onboarding process but have not received my Foundational ID. What should I do?`,
      answer: `Your Foundational ID can be found under the Credentials tab (on the bottom navigation bar). You will be notified that you have been issued a Foundational ID under Your Recent History. If you do not receive the notification and cannot find your Foundational ID under Credentials, refresh your app. If you continue to face a problem, contact toll-free NDI support helpline at 1199.`,
    },
    {
      question: `What happens if my personal information doesn’t match during the authentication process?`,
      answer: `Reinitiate your onboarding process in case of any error/mismatch in information. If you continue to receive the error message, contact toll-free NDI support helpline at 1199 to troubleshoot. Note: once issued, your Foundational ID cannot be edited.`,
    },
    {
      question: `I have my personal information submitted to DCRC but haven't completed my biometric update. Will I be able to register on Bhutan NDI?`,
      answer: `Registration and access to the Bhutan NDI wallet necessitates the update of biometrics for veriﬁcation and authentication purposes and serves as a vital security measure put in place in the Bhutan NDI ecosystem. Without completing the biometric authentication process, you won't be able to register or access the services of Bhutan NDI.`,
    },
    {
      question: `Is Bhutan NDI registration a mandatory requirement for all Bhutanese citizens?`,
      answer: `No, registration on Bhutan NDI is not mandatory for all Bhutanese citizens or residents. However, the service ensures easy and seamless access to government and business services, making registration and usage highly beneficial for users.`,
    },
    {
      question: `I forgot my Bhutan NDI wallet pin. What should I do?`,
      answer: `If you insert the wrong pin three times, you will see the “Forgot Pin” button. You can reset your pin by clicking on that “Forgot Pin” button. Note: you will have to complete biometric facial authentication to reset your pin.`,
    },
    {
      question: `Can I reset my Login pin on the Bhutan NDI wallet?`,
      answer: `Yes, you can go to Menu>Settings>Reset Pin and set a new pin. Please note that you will have to enter your current pin to set a new pin.`,
    },
    {
      question: `Can I backup my Bhutan NDI wallet?`,
      answer: `Bhutan NDI comes with backup and recovery options that allow users to backup their wallet. You can either opt to backup your wallet during the initial onboarding process or choose to backup at a later point by visiting the More>Settings>Backup on your Bhutan NDI wallet. Backup of your wallet will allow you to restore your credentials on a new device.`,
    },
    {
      question: `What happens if I lose my phone? Will I be able to recover my Bhutan NDI wallet/ restore my veriﬁed credentials in my wallet?`,
      answer: `We recommend you to backup your Bhutan NDI wallet each time you have been issued a new credential or when you have updated any of your personal details. If you you have not opted for backup during the initial onboarding, you will also see the reminder at the top banner prompting you to backup your wallet. You will get the same reminder each time a new connection has been established or a new credential has been issued. You can also choose to automatically backup your wallet by enabling the feature under More>Settings>Automatic Backup.`,
    },
    {
      question: `How often should I backup my Bhutan NDI wallet?`,
      answer: `You can remove your biometrics by completing the onboarding process on the Bhutan NDI app.`,
    },
    {
      question: `Can I change my Bhutan NDI wallet backup settings?`,
      answer: `Yes, you can click on More>Settings to update/change the settings of your wallet backup.`,
    },
    {
      question: `What are veriﬁed credentials?`,
      answer: `Veriﬁed credentials (VC) are digital credentials that enable users to easily, safely, and privately prove your identities/information related to yourself. For credentials to be veriﬁable, the veriﬁer (the one requesting your proofs/information) must be able to determine: Who issued the credential, It has not been tampered with, It is not expired/revoked/suspended.`,
    },
    {
      question: `Who can issue trusted credentials for me?`,
      answer: `All verified issuers that have integrated with Bhutan NDI can issue you credentials related to their respective services.`,
    },
    {
      question: `Who can verify my credentials through a proof request?`,
      answer: `Veriﬁcation of credentials is conducted by authorized parties listed as a veriﬁer on the Bhutan NDI Trust Registry.`,
    },
    {
      question: `Who has access to my personal information/veriﬁed credentials?`,
      answer: `Your veriﬁed credentials/personal information is stored only on your personal Bhutan NDI wallet. Those entities/individuals with whom you have explicitly consented/approved to share your credentials through a proof request will be able to access your personal information on a need-to-know basis.`,
    },
    {
      question: `Can I use the veriﬁed credentials stored in my Bhutan NDI wallet for oﬃcial documentation?`,
      answer: `Yes. With the passage of the National Digital Identity Act 2023, veriﬁed credentials stored in your Bhutan NDI wallet can be used as an alternative to physical identity documents for digital transactions and interactions with government and business service providers.`,
    },
    {
      question: `Does my veriﬁed credential on the Bhutan NDI wallet have limited validity/expiry date?`,
      answer: `Validity of all veriﬁed credentials (VC) on Bhutan NDI will be determined by the issuer of the credential. For example, your driver’s license credentials will expire with the expiry of your driver’s license validity period, after which your VC will be revoked. You will have to request the issuer to issue you a new/updated VC when any of your VC has been revoked.`,
    },
    {
      question: `What are revoked credentials?`,
      answer: `Revoked credentials are veriﬁed credentials that are no longer valid and cannot be reinstated. Such credentials will have to be reissued by the issuer.`,
    },
    {
      question: `What are suspended credentials?`,
      answer: `Suspended credentials are veriﬁed credentials that have been suspended for a limited period and will be reinstated by the issuer after the suspension period/criteria lapses.`,
    },
    {
      question: `What happens when any of my veriﬁed credential expires?`,
      answer: `When any of your veriﬁed credential (VC) expires, the issuer will revoke/suspend your VC. You can request the issuer of the VC to reissue a new/updated VC into your wallet. If your VC has been suspended, you will have to wait for the suspension period/criteria to lapse.`,
    },
    {
      question: `Can I use my veriﬁed credentials in my Bhutan NDI wallet for international identity veriﬁcation?`,
      answer: `No. Currently, Bhutan NDI has been rolled out only for connection and interaction with domestic government and business service providers. However, Bhutan NDI has been designed and developed to meet the global web standard mandated by the World Wide Web Consortium (W3C) and biometric algorithm standards approved by National Institute of Standards & Technology (NIST). This makes Bhutan NDI compatible with international protocols and can be used across diﬀerent platforms and organizations, opening up the possibility of interoperability and portability across borders and systems in the future.`,
    },
    {
      question: `What are Self Attested Credentials?`,
      answer: `Self Attested Credentials are information/proofs about yourself that you claim to be true but have not been issued by a veriﬁed authority. For e.g., your current address, mobile number, and allergy details.`,
    },
    {
      question: `What information about myself can I add as self attested credentials?`,
      answer: `Currently, you can add your one or more of the following as self attested credentials: Current addresses Mobile numbers Allergy details`,
    },
    {
      question: `How can I add/create self attested credentials on my Bhutan NDI wallet?`,
      answer: `You can add your self attested credentials by visiting Menu>Self Attested Credential and select the credential type from the drop down. Fill in the details of the credential you want to create and save. The self attested credential will then reﬂect under Credentials on your Bhutan NDI wallet. You can also select the heart icon on the digital ID card to bring the self attested credential to the home screen.`,
    },
    {
      question: `What/Who is an Issuer?`,
      answer: `Issuers are the source of credentials. Every credential has an issuer. Most issuers are organizations such as government agencies (passports, driver’s license), ﬁnancial institutions (credit cards, bank account details), universities (degrees, transcripts), corporations (employment credentials), NGOs (membership cards) etc.`,
    },
    {
      question: `What is a connection?`,
      answer: `A digital and secure peer-to-peer channel is used to connect the issuer of the veriﬁed credential/ID, the holder of the ID, and the veriﬁer of the ID. The issuer, holder, and veriﬁer then can securely communicate through the established “connection.”`,
    },
    {
      question: `What should I do if any information in my Foundational ID or Permanent Address verified credential has changed (e.g. Name, Household Number, etc.)?`,
      answer: `If information pertaining to your Foundational ID or your permanent address has changed, you can visit the Department of Civil Registration and Census (DCRC) and update your personal details. This updated information will then be automatically updated and reflected in your Bhutan NDI wallet.`,
    },
    {
      question: `What should I do if any information related to my Foundational ID or Permanent Address has changed (e.g., Name, Household Number, etc.)?`,
      answer: `If information pertaining to your Foundational ID or your permanent address has changed, you can visit the Department of Civil Registration and Census (Bhutanese nationals) or Department of Immigration (foreign nationals) and update your personal details. After the concerned department has updated your personal information, you will have to reinitiate the onboarding for receive the updated Foundational ID/permanent address details in your wallet.`,
    },
    {
      question: `What should I do if information related to any of my veriﬁed credentials have changed?`,
      answer: `If any of your veriﬁed credential (VC) issued by business or government service providers has changed, please contact the concerned issuer to issue the updated VC to your Bhutan NDI wallet. Please note that as a responsible national digital identity holder, it is your responsibility to make sure that all your VCs are up to date and accurate.`,
    },
    {
      question: `How often should I update my Bhutan NDI profile?`,
      answer: `It's recommended to review and update your Bhutan NDI profile whenever there are changes to your personal information, such as a change in address or contact, self-attested details, or other information issued to you by business service providers. Keeping your information up-to-date ensures seamless transactions.`,
    },
    {
      question: `Is the use of Bhutan NDI mandatory for all Bhutanese citizens?`,
      answer: `No, use of Bhutan NDI wallet is not mandatory for any Bhutanese citizens or residents. However, the service ensures easy and seamless access to government and business services, making registration and usage highly beneﬁcial for users.`,
    },
    {
      question: `Where can I use Bhutan NDI?`,
      answer: `You can use the Bhutan NDI app to login to the citizenship portal to access government-to-citizen services and certain business services. It must be noted that the Bhutan NDI features and services are constantly being updated. Therefore, you can use the wallet to access banking, education, health, insurance, telecommunication, transportation, and utility services online in the future with the on-going updates being made to the Bhutan NDI wallet. We recommend you follow Bhutan NDI’s social media channels to stay informed about the updates made to the Bhutan NDI wallet.`,
    },
    {
      question: `Can I use Bhutan NDI on two or more devices?`,
      answer: `No, you cannot use the Bhutan NDI wallet on more than one device at a time. Bhutan NDI allows only single onboarding to ensure highest level of security for users.`,
    },
    {
      question: `Can I use my Bhutan NDI wallet without a smartphone?`,
      answer: `Currently, Bhutan NDI wallet is available only on smartphones and tablets enabled by iOS/Android systems. However, with the upcoming features scheduled for later phases of product development, Bhutan NDI will be made available on certain feature phones as well as printed cards enabled by certain type of cryptographically enabled dense QR code. We recommend you follow Bhutan NDI’s social media channels to stay informed about the updates made to the Bhutan NDI wallet.`,
    },
    {
      question: `Can I use the Bhutan NDI App without active internet connection?`,
      answer: `Bhutan NDI app requires active internet connection for seamless user experience.`,
    },
    {
      question: `Can I use the Bhutan NDI wallet on the web app/browser?`,
      answer: `No, you cannot use Bhutan NDI on a web app through a browser. Currently, the wallet is available only on an iOS/Android mobile device.`,
    },
    {
      question: `Why should I use the Bhutan NDI wallet?`,
      answer: `Bhutan NDI enables trusted interactions between individual users, government authorities, service providers, and business enterprises. The wallet can be used for sharing identity credentials to authenticate yourself digitally and access services and platforms online.`,
    },
    {
      question: `Are there any fees associated with usage of Bhutan NDI?`,
      answer: `No, there are no fees associated with registration or use of Bhutan NDI. The Bhutan NDI service is provided to citizens and residents free of charge, ensuring accessibility and inclusion for all individuals. Bhutan NDI is designed to simplify and enhance your interactions with government and business services without any ﬁnancial burden.`,
    },
    {
      question: `What are the benefits of Bhutan NDI?`,
      answer: `Bhutan NDI enables trusted interactions between individual users, government authorities, service providers, and business enterprises. The wallet can be used for sharing identity credentials to authenticate yourself digitally and access services online.`,
    },
    {
      question: `What are the beneﬁts of Bhutan NDI as compared to paper-based identity card?`,
      answer: `Bhutan NDI brings several advantages over paper-based identity cards, including greater convenience with easy access to platforms and services online, eliminating the need for in-person oﬃce visits. Moreover, it enhances security by minimizing reliance on physical documents that are susceptible to loss or forgery. Additionally, the system empowers you with control over your information, enabling you to selectively share only the required personal details when necessary.`,
    },
    {
      question: `Is Bhutan NDI a secure application?`,
      answer: `Bhutan NDI is a highly secure application. User’s personal data are stored in your personal device and not on cloud or third-party systems. This signiﬁcantly reduces the threat to loss of personal data. Consent is core to the product, thus, providing you with greater control over your personal information than ever before. Additionally, Bhutan NDI has been developed with cutting-edge technology that uses blockchain for veriﬁcation of user’s data, making the platform highly secure and trustable. Your Bhutan NDI wallet is also secured with numeric pin and biometrics which helps restrict unauthorized party to access your wallet.`,
    },
    {
      question: `Where does my personal information get stored?`,
      answer: `All personal identity information will be stored on your personal mobile device and therefore you will have access to it at all times.`,
    },
  ],
  organizations: [
    {
      question: `What are verifiable credentials?`,
      answer: `Verifiable credentials are a set of information that some authority (issuer) claims to be true about the subject of the credential (holder)—and which in turn enables the subject to convince others (verifier) who trust that authority of these truths.`,
    },
    {
      question: `What are Decentralized Identifiers?`,
      answer: `Decentralized Identifiers (DIDs) are a type of identifier that are cryptographically secure, and can be used to represent individuals, organizations, or any other entities that require a digital identity. DIDs are based on decentralized technologies such as blockchain and distributed ledgers, and are designed to provide a secure and privacy-preserving way to manage digital identities. DIDs are unique, persistent, and tamper-evident, meaning that they cannot be easily altered or deleted without detection. DIDs don’t require a central registry/authority to create and manage.`,
    },
    {
      question: `What are schemas?`,
      answer: `A schema is used to define the structure and content of a digital identity credential, which can be used to represent a set of personal information in a secure, structured, and verifiable way. It defines types of data that can be included in an identity credential, such as name, date of birth, or address, and specifies the format and validation rules for each type of data. This ensures that the identity credential is complete, accurate, and meets the requirements of the issuer, verifier, and any relevant regulations or standards.`,
    },
    {
      question: `Who are the participants in a “trust triangle” ecosystem?`,
      answer: `The trust triangle is a conceptual model used in self-sovereign identity (SSI) to represent the relationships and interactions between three entities: the individual (i.e. the holder), the issuer, and the verifier. In the trust triangle model, the individual is the center of the identity ecosystem, and has control over their own identity data. The issuer is responsible for creating and verifying identity credentials, and can attest to the accuracy of the information contained in those credentials. The verifier is responsible for requesting and verifying identity credentials, and can use the information contained in those credentials to authenticate and to make access control decisions. The trust triangle model is designed to provide a more secure and privacy-preserving way to manage digital identities, and to enable greater user control over personal data.`,
    },
    {
      question: `What are digital/mobile agents?`,
      answer: `Digital agents represent the entities/actors participating in the digital identity ecosystem, and are responsible for managing and controlling the exchange of individual's identity data, and for interacting with other agents and entities in the identity ecosystem. Digital agents can also be used to enforce access control policies, manage personal data, and provide secure communication between entities in the identity network. Digital agents are a key component of the SSI infrastructure, and enable individuals to exercise greater control over their personal data and identities in a more secure and privacy-preserving way.`,
    },
    {
      question: `What are connections?`,
      answer: `A digital and secure peer-to-peer channel is used to connect the issuer of the ID, the holder of the ID, and the verifier of the ID. When each of these actors explicitly consent to connecting with the other actor in the ecosystem, a “connection” is established between these actors`,
    },
    {
      question: `What is the relationship between Decentralized Identifiers and Verifiable Credentials?`,
      answer: `Decentralized Identifiers (DIDs) and Verifiable Credentials are key components of the emerging self-sovereign identity (SSI) ecosystem. DIDs are a type of identifier that enables the creation of self-sovereign digital identities and VCs are digital documents that contain verifiable claims about an individual or entity, such as their name, date of birth, or address. DIDs help create, store, and manage digital identities, while Verifiable Credentials provide a standardized way to represent, store, and share verifiable claims about those identities. The combination of DIDs and VCs allows individuals to exercise greater control over their personal data and identities, while still providing a trusted and verifiable way to interact with other entities in the digital world.`,
    },
    {
      question: `Are Verifiable Credentials (VCs) revocable? / How can I revoke VCs I issued? / Who can revoke VCs?`,
      answer: `Yes, VCs can be revoked. Only the issuer with legit reasons as per the provision in the NDI Governance Framework can revoke a VC. Revocation agency with valid reasons as defined in the NDI Governance Framework can authorize/direct revocation of VCs.`,
    },
    {
      question: `How will I know if a Verifiable Credential has been revoked?`,
      answer: `As a verifier, the system will automatically give revocation status of a credential shared by the user. As a holder, one may get notification when a credential is revoked.`,
    },
    {
      question: `What is Zero Knowledge Proof?`,
      answer: `A zero-knowledge proof is a cryptographic protocol that allows one party to prove to another party that they know a specific piece of information, without revealing any additional information beyond what is necessary to prove the claim. In the context of self-sovereign identity (SSI), zero-knowledge proofs can be used to verify identity credentials and other personal information without revealing the underlying data.
For example, if an individual needs to prove that they are over 18 years old to gain access to a certain service, then with a zero-knowledge proof protocol, the individual could prove that they are over 18 without revealing their exact date of birth or any other personal information beyond what is necessary to prove the claim.`,
    },
    {
      question: `What are public and private keys?`,
      answer: `A public key is a cryptographic string that is publicly shared by an entity and can be used to decrypt messages or verify digital signatures. On the other hand, a private key is kept secret and is used to encrypt messages or create digital signatures. In SSI, a public key can be associated with a decentralized identifier (DID), which represents a digital identity, and can be used to verify digital credentials or establish secure communication with other entities in the network. Private keys are used to authenticate and authorize transactions and must be kept secure and confidential to prevent unauthorized access or misuse of personal data.`,
    },
    {
      question: `What is Self-Sovereign Identity?`,
      answer: `Self-sovereign identity (SSI) is a decentralized digital identity model that enables trusted interactions between individual users, government authorities, service providers, and business enterprises. In the SSI model, an individual's personal credentials are stored on their personal devices or in a decentralized identity network. This allows individuals to control who has access to their personal data, and to share only the information that is necessary for a specific transaction or interaction, still providing the necessary verification and authentication mechanisms for trusted interactions with other parties.`,
    },
  ],
};

export default faqData;
