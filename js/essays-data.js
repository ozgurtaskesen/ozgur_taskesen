/**
 * Model Opinion Essays Data
 * Each essay is ~300 words, structured in 4 paragraphs (intro, body1, body2, conclusion).
 * Categorised by relationship type: advantage-disadvantage, problem-solution, cause-effect, compare-contrast.
 */

const MODEL_ESSAYS = [
  // ===== ADVANTAGE-DISADVANTAGE ESSAYS =====
  {
    id: 1,
    title: "Should Students Wear School Uniforms?",
    type: "advantage-disadvantage",
    tag: "Advantage & Disadvantage",
    paragraphs: [
      {
        label: "Introduction",
        text: "The question of whether students should wear school uniforms has been debated for many years. Some people believe that uniforms create a sense of equality and discipline, while others argue that they limit students' freedom of expression. This essay will discuss the main advantages and disadvantages of wearing school uniforms."
      },
      {
        label: "Body 1",
        text: "One of the main advantages of school uniforms is that they promote equality among students. When everyone wears the same clothes, there is less pressure to wear expensive brands, which can reduce bullying related to appearance. Furthermore, uniforms help students focus on their studies rather than on fashion. In addition, wearing a uniform can create a sense of belonging and school pride, which may improve the overall atmosphere in the school."
      },
      {
        label: "Body 2",
        text: "On the other hand, a key disadvantage of school uniforms is that they limit individual expression. Young people often use clothing to express their personality, and uniforms take away this opportunity. Moreover, uniforms can be expensive for some families, especially when schools require specific brands. Another drawback is that students may feel uncomfortable in uniforms that do not suit their body type or personal preferences, which could negatively affect their confidence."
      },
      {
        label: "Conclusion",
        text: "In conclusion, while school uniforms can promote equality and improve the school environment, they can also restrict personal expression and create financial difficulties for some families. On balance, I believe that the advantages of school uniforms outweigh the disadvantages, as they help create a more focused and fair learning environment for all students."
      }
    ]
  },
  {
    id: 2,
    title: "The Advantages and Disadvantages of Social Media",
    type: "advantage-disadvantage",
    tag: "Advantage & Disadvantage",
    paragraphs: [
      {
        label: "Introduction",
        text: "Social media has become an essential part of daily life for millions of people around the world. Platforms such as Instagram, Twitter, and Facebook allow users to connect, share information, and express their views. However, social media also has several drawbacks that cannot be ignored. This essay will examine the advantages and disadvantages of using social media."
      },
      {
        label: "Body 1",
        text: "Perhaps the greatest advantage of social media is that it enables people to stay connected with friends and family, regardless of distance. In addition, social media provides access to a wide range of information and news, helping people stay informed about current events. Moreover, it can be a powerful tool for education, as students can join study groups, share resources, and learn from online communities. Social media also allows small businesses to reach new customers without spending large amounts on advertising."
      },
      {
        label: "Body 2",
        text: "However, the main drawback of social media is its negative impact on mental health. Studies have shown that excessive use can lead to anxiety, depression, and low self-esteem, especially among teenagers. A significant downside is that social media can be addictive, causing people to spend hours scrolling instead of engaging in productive activities. Furthermore, the spread of false information and cyberbullying are serious concerns that affect users of all ages."
      },
      {
        label: "Conclusion",
        text: "To sum up, social media offers clear benefits, such as connectivity and access to information, but it also poses risks to mental health and productivity. In my opinion, social media can be a valuable tool if it is used responsibly and in moderation. People should be aware of its dangers and take steps to protect themselves from its negative effects."
      }
    ]
  },

  // ===== PROBLEM-SOLUTION ESSAYS =====
  {
    id: 3,
    title: "Traffic Congestion in Big Cities",
    type: "problem-solution",
    tag: "Problem & Solution",
    paragraphs: [
      {
        label: "Introduction",
        text: "Traffic congestion is one of the most serious problems in large cities around the world. As populations grow and more people own cars, roads become increasingly crowded, leading to long delays and frustration for commuters. This essay will discuss the main problems caused by traffic congestion and suggest some practical solutions to address this issue."
      },
      {
        label: "Body 1",
        text: "One of the biggest challenges caused by traffic congestion is the waste of time. Many workers spend hours commuting each day, which reduces their productivity and affects their quality of life. In addition, heavy traffic leads to higher levels of air pollution, which has a negative impact on public health. Studies show that people living near busy roads are more likely to suffer from respiratory diseases. Furthermore, traffic jams increase fuel consumption, which is both costly for drivers and harmful to the environment."
      },
      {
        label: "Body 2",
        text: "There are several effective solutions that could help reduce traffic congestion. One possible solution would be to invest more in public transport systems, such as buses, trams, and metro lines, making them affordable and reliable. This would encourage people to leave their cars at home. Another practical approach would be to introduce congestion charges in city centres, which has proven successful in cities like London. Additionally, governments could promote remote working policies to reduce the number of people commuting during peak hours."
      },
      {
        label: "Conclusion",
        text: "In conclusion, traffic congestion causes significant problems including wasted time, air pollution, and increased costs. However, by improving public transport, introducing congestion charges, and encouraging remote work, cities can effectively reduce traffic and improve the quality of life for their residents. It is essential that governments take action now before these problems become even worse."
      }
    ]
  },
  {
    id: 4,
    title: "Youth Unemployment: Problems and Solutions",
    type: "problem-solution",
    tag: "Problem & Solution",
    paragraphs: [
      {
        label: "Introduction",
        text: "Youth unemployment is a growing concern in many countries today. A large number of young people are struggling to find jobs after finishing their education, which creates both personal and social difficulties. This essay will explore the main problems associated with youth unemployment and propose some solutions to help address this important issue."
      },
      {
        label: "Body 1",
        text: "A major issue facing young people is the gap between their education and the skills employers require. Many graduates find that their qualifications do not match the demands of the job market, leaving them unprepared for available positions. An increasingly common problem is the lack of work experience, as most employers prefer candidates who already have practical skills. As a result, young people often become stuck in a cycle where they cannot get experience without a job, and they cannot get a job without experience."
      },
      {
        label: "Body 2",
        text: "An effective way to address this problem is to improve the connection between education and industry. Schools and universities could offer more internship programmes and vocational training to give students hands-on experience before they graduate. The government could tackle this by creating incentives for companies that hire young workers, such as tax reductions or subsidies. Furthermore, career guidance services should be strengthened so that young people can make more informed decisions about their future careers."
      },
      {
        label: "Conclusion",
        text: "To conclude, youth unemployment is a serious problem caused mainly by the gap between education and the demands of the workplace. By strengthening vocational training, encouraging employers to hire young people, and providing better career advice, we can help the next generation find meaningful employment and build a more productive society."
      }
    ]
  },

  // ===== CAUSE-EFFECT ESSAYS =====
  {
    id: 5,
    title: "The Causes and Effects of Childhood Obesity",
    type: "cause-effect",
    tag: "Cause & Effect",
    paragraphs: [
      {
        label: "Introduction",
        text: "Childhood obesity has become a major health concern across the globe. The number of overweight children has increased dramatically in recent decades, and this trend shows no signs of slowing down. This essay will examine the main causes of childhood obesity and discuss the effects it has on children's health and well-being."
      },
      {
        label: "Body 1",
        text: "One of the main reasons for the rise in childhood obesity is the change in dietary habits. Many children consume large amounts of processed food, sugary drinks, and fast food, which are high in calories but low in nutritional value. This is mainly due to the easy availability and heavy advertising of unhealthy food products. A key factor contributing to this problem is the decline in physical activity, as children spend more time using screens and electronic devices instead of playing outdoors or participating in sports."
      },
      {
        label: "Body 2",
        text: "As a result of these unhealthy lifestyles, childhood obesity leads to several serious consequences. One consequence is the increased risk of developing chronic diseases such as type 2 diabetes, heart disease, and joint problems at a young age. This has a significant impact on the healthcare system, as treating these conditions is expensive. Furthermore, obese children often suffer from low self-esteem, bullying, and social isolation, which can lead to mental health problems such as depression and anxiety."
      },
      {
        label: "Conclusion",
        text: "In conclusion, childhood obesity is primarily caused by poor dietary habits and a lack of physical activity. The effects of this problem are far-reaching, affecting both physical and mental health. It is crucial that parents, schools, and governments work together to promote healthier lifestyles and ensure that children grow up in environments that encourage good nutrition and regular exercise."
      }
    ]
  },
  {
    id: 6,
    title: "Why Do Students Drop Out of University?",
    type: "cause-effect",
    tag: "Cause & Effect",
    paragraphs: [
      {
        label: "Introduction",
        text: "In recent years, there has been a noticeable increase in the number of students dropping out of university before completing their degrees. This situation is concerning because higher education is generally seen as essential for career success. This essay will explore the key causes of this trend and discuss the effects it has on both individuals and society."
      },
      {
        label: "Body 1",
        text: "The primary cause of university dropout is financial difficulty. Many students struggle to pay tuition fees, accommodation costs, and living expenses, which puts enormous pressure on them. This situation arises because student loans may not cover all expenses, and part-time work can interfere with studies. Another significant reason is the lack of academic preparation. Some students find university courses much harder than expected, and without proper support, they become overwhelmed and lose motivation to continue."
      },
      {
        label: "Body 2",
        text: "The effects of dropping out of university can be serious and long-lasting. This leads to reduced career opportunities, as many employers require a university degree for professional positions. Consequently, individuals without degrees often earn lower salaries throughout their lives. The effect on society is also notable, as high dropout rates mean fewer skilled professionals in important fields such as healthcare, engineering, and education. Additionally, students who drop out may experience feelings of failure and regret, which can affect their confidence and well-being."
      },
      {
        label: "Conclusion",
        text: "To sum up, financial pressures and inadequate academic preparation are the main reasons why students leave university early. The consequences of this decision affect not only the individual but also the wider community. Therefore, universities and governments should provide more financial support and academic assistance to help students complete their education successfully."
      }
    ]
  },

  // ===== COMPARE-CONTRAST ESSAYS =====
  {
    id: 7,
    title: "Online Learning vs. Traditional Classroom Learning",
    type: "compare-contrast",
    tag: "Compare & Contrast",
    paragraphs: [
      {
        label: "Introduction",
        text: "The way people learn has changed significantly with the development of technology. Today, students can choose between online learning and traditional classroom learning, and each option has its own strengths and weaknesses. This essay will compare and contrast these two approaches to education in order to determine which one is more effective for learners."
      },
      {
        label: "Body 1",
        text: "Both online and traditional learning share the same goal of providing quality education, but they differ significantly in terms of flexibility. Online learning allows students to study at their own pace and from any location, which is particularly beneficial for working professionals and those living in remote areas. In the same way, both methods use structured courses and assessments to measure progress. However, traditional learning offers a fixed schedule and physical classroom environment, which helps some students stay disciplined and focused."
      },
      {
        label: "Body 2",
        text: "In contrast, the two approaches differ greatly in terms of social interaction and support. Traditional classroom learning provides face-to-face interaction with teachers and classmates, which encourages discussion, teamwork, and immediate feedback. Unlike traditional learning, online education can feel isolating, as students often study alone and have limited opportunities for group work. On the other hand, online learning often provides access to a wider range of resources, including recorded lectures and international courses that may not be available locally."
      },
      {
        label: "Conclusion",
        text: "In conclusion, while both online and traditional learning have clear advantages, they serve different types of learners. Traditional learning is better suited for students who need structure and social interaction, whereas online learning is ideal for those who value flexibility and independence. In my view, a combination of both methods would offer the most effective learning experience for the majority of students."
      }
    ]
  },
  {
    id: 8,
    title: "Living in a City vs. Living in the Countryside",
    type: "compare-contrast",
    tag: "Compare & Contrast",
    paragraphs: [
      {
        label: "Introduction",
        text: "Choosing where to live is an important decision that affects many aspects of a person's life. Some people prefer the excitement and convenience of city life, while others enjoy the peace and natural beauty of the countryside. This essay will compare and contrast life in these two settings and discuss which option might be better for different people."
      },
      {
        label: "Body 1",
        text: "One thing city and countryside living have in common is that both offer a sense of community, although in different ways. In cities, people have access to a wide range of services, entertainment, and job opportunities. Similarly, both settings allow people to build meaningful relationships with neighbours and local communities. However, cities offer greater convenience in terms of public transport, healthcare facilities, and shopping centres, making daily life more practical for many residents."
      },
      {
        label: "Body 2",
        text: "The main difference between city and countryside living lies in the pace of life and the environment. While cities are fast-paced, noisy, and often polluted, the countryside offers a slower, quieter lifestyle surrounded by nature. Unlike city dwellers, people in rural areas benefit from cleaner air, open spaces, and a stronger connection to the natural world. On the other hand, countryside residents often face challenges such as limited job opportunities, fewer educational options, and longer distances to essential services."
      },
      {
        label: "Conclusion",
        text: "To conclude, both city and countryside living have distinct advantages and disadvantages. City life offers convenience and opportunities, whereas the countryside provides peace and a healthier environment. Ultimately, the best choice depends on a person's priorities and lifestyle preferences. In my opinion, a balanced approach, such as living near a city but in a quieter suburb, could offer the best of both worlds."
      }
    ]
  }
];

// Essay topics available for student writing
const ESSAY_TOPICS = [
  { value: "topic1", text: "Should students wear uniforms at school?", type: "advantage-disadvantage" },
  { value: "topic2", text: "Is social media more harmful than helpful for teenagers?", type: "advantage-disadvantage" },
  { value: "topic3", text: "Should governments invest more in public transport?", type: "problem-solution" },
  { value: "topic4", text: "Is it better to live in a city or in the countryside?", type: "compare-contrast" },
  { value: "topic5", text: "Should homework be banned in schools?", type: "advantage-disadvantage" },
  { value: "topic6", text: "Do the advantages of technology in education outweigh the disadvantages?", type: "advantage-disadvantage" },
  { value: "topic7", text: "What are the main causes and effects of air pollution in cities?", type: "cause-effect" },
  { value: "topic8", text: "How does online learning compare to traditional classroom learning?", type: "compare-contrast" },
  { value: "topic9", text: "Some people believe that e-books can help to save the world by not cutting down trees, while others believe that e-books lack soul and that reading a print book is easier. What is your opinion?", type: "advantage-disadvantage" },
  { value: "topic10", text: "Some people believe that university students should be required to attend classes. Others believe that going to classes should be on voluntary basis for students. What is your opinion?", type: "advantage-disadvantage" },
  { value: "topic11", text: "The Internet includes many websites with images and content that are inappropriate. Some people think that websites like these should be censored by governments, while others believe this is not right. What is your opinion?", type: "advantage-disadvantage" },
  { value: "topic12", text: "The world is experiencing a dramatic increase in population, which is causing problems not only for poor, underdeveloped countries, but also for industrialised and developed nations. What is your opinion?", type: "problem-solution" },
  { value: "topic13", text: "International space exploration has received a lot of attention for different reasons over the last century. However, it is widely believed that space exploration tasks require too much money, and the money allocated for this should be spent on more important things. What is your opinion?", type: "advantage-disadvantage" },
  { value: "topic14", text: "The crime rate nowadays is increasing to a greater extent compared to the previous century. People believe that it is the advanced technology that needs to be blamed for this. What is your opinion?", type: "cause-effect" },
  { value: "topic15", text: "Education should be accessible to people from all economic backgrounds. All levels of education, excluding tertiary (university) education needs to be free to everyone. What is your opinion?", type: "advantage-disadvantage" },
  { value: "topic16", text: "More people are now using the internet to meet and socialise with new people. While some people believe that this has brought people much closer to each other, others argue that it has made people more isolated. What is your opinion?", type: "advantage-disadvantage" },
  { value: "topic17", text: "With the development of digital media, there is no need for print and broadcast media. What is your opinion?", type: "advantage-disadvantage" },
  { value: "topic18", text: "Most societies have too many homeless people on their streets, and there are a lot of ways to tackle this issue. What is your opinion?", type: "problem-solution" },
  { value: "topic19", text: "Fast food companies should not be allowed to advertise and promote their products on TV and digital platforms because of the health risks their products pose for young people. What is your opinion?", type: "advantage-disadvantage" },
  { value: "topic20", text: "Today, many parents place too much pressure on their children to be successful at school, but this does more harm than good. What is your opinion?", type: "advantage-disadvantage" },
  { value: "topic21", text: "In most of the developed countries which have achieved a high level of affluence, children hardly ever spend quality time with their relatives, especially grandparents. This may lead to loss of many social opportunities. What is your opinion?", type: "cause-effect" },
  { value: "topic22", text: "Nowadays, many people can live until their 90s and beyond, and it is believed that this is because of the modern lifestyle. What is your opinion?", type: "cause-effect" }
];
