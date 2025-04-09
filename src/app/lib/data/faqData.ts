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
  ],
  organizations: [
    {
      question: "How do I onboard a new employee?",
      answer: "Test 1",
    },
    {
      question: "Can we integrate with external systems?",
      answer: ":))",
    },
  ],
};

export default faqData;
