import { CitationAgent } from 'function-agents';

try {
    const agent = new CitationAgent(process.env.OPENAI_API_KEY, 'gpt-4-0613');

    const userMessage = `What is Cryptography?`;

    const context = `
      """
      Source: algorithms.pdf Page Number: 42
      Content: The bubble sort algorithm works by repeatedly swapping adjacent elements if they are in the wrong order.
      """

      """
      Source: machine_learning_intro.pdf Page Number: 15
      Content: Supervised learning is an approach where the model is trained on a labeled dataset, which means that each training example is paired with an output label.
      """

      """
      Source: software_design_patterns.pdf Page Number: 7
      Content: The Singleton pattern ensures that a class has only one instance and provides a global point to access it.
      """

      """
      Source: programming_languages.pdf Page Number: 23
      Content: JavaScript is a high-level, often just-in-time compiled, and multi-paradigm language. It has curly-bracket syntax, dynamic typing, prototype-based object-orientation, and first-class functions.
      """

      """
      Source: AI_ethics.pdf Page Number: 9
      Content: One of the challenges in AI ethics is the potential for data to be biased, which can subsequently result in discriminatory behavior by automated systems.
      """

      """
      Source: operating_systems.pdf Page Number: 68
      Content: A kernel is the central part of an operating system. It manages the operations of the computer and the hardware, most notably memory and CPU time.
      """

      """
      Source: web_technologies.pdf Page Number: 32
      Content: HTML, CSS, and JavaScript are the cornerstone technologies for web development.
      """

      """
      Source: cloud_computing_basics.pdf Page Number: 55
      Content: Cloud computing provides a simple way to access servers, storage, databases, and a broad set of application services over the internet.
      """

      """
      Source: data_structures.pdf Page Number: 88
      Content: A hash table is a data structure which stores key-value pairs. Hash tables offer a combination of efficient runtime complexity for search, add, and delete operations.
      """

      """
      Source: network_security.pdf Page Number: 113
      Content: Cryptography is essential for secure communications over any network where you cannot completely trust the other end. Extra stuff blah blah blah
      """   
    `;

    const response = await agent.run(userMessage, context);

    console.log('response', response);

    /*
    CitationAgent invoked with: What is Cryptography? 

    CitationAgent successfully completed in  6691 ms

    response {
      message: "Cryptography is essential for secure communications over any network where you cannot completely trust the other end.",
      citation: {
        filename: "network_security.pdf",
        pageNumber: 113,
        explanationOfWhyThisSourceWasChosen: "This source was chosen because it provides a clear and concise definition of Cryptography."
      },
      success: true,
      duration: 6691
    }
  */
} catch (error) {
    console.log('error', error);
}
