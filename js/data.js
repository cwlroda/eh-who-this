// Name component database + name structures + banks.
//
// SATIRE NOTICE: every name in this game is assembled mechanically from generic,
// commonplace, and deliberately stereotypical name parts purely for comic effect.
// The parts below are common given names, romanised surnames and patronymics drawn
// from Singapore's four main communities. Any full name the game produces, and any
// resemblance to a real person, is entirely coincidental.
//
// Lists are stored as plain string arrays grouped by race/role/gender, then expanded
// into Part records at the bottom. Some pools are reused across roles (e.g. a
// Eurasian first name can also serve as a middle name) to keep the data lean.

const RAW = {
  chinese: {
    // English given names used by Chinese Singaporeans (role: first)
    first_m: ['David', 'Jason', 'Melvin', 'Kelvin', 'Alvin', 'Marcus', 'Bryan', 'Brandon', 'Darren', 'Ryan', 'Jonathan', 'Daniel', 'Samuel', 'Benjamin', 'Nicholas', 'Aaron', 'Adrian', 'Andrew', 'Anthony', 'Bernard', 'Brian', 'Calvin', 'Clarence', 'Clement', 'Colin', 'Dennis', 'Derrick', 'Desmond', 'Dominic', 'Edmund', 'Edward', 'Edwin', 'Eric', 'Ernest', 'Eugene', 'Francis', 'Gabriel', 'Gary', 'Gerald', 'Glenn', 'Gordon', 'Henry', 'Howard', 'Ivan', 'James', 'Jeffrey', 'Jeremy', 'Jerome', 'Jimmy', 'Joel', 'John', 'Joseph', 'Joshua', 'Julian', 'Justin', 'Keith', 'Kenneth', 'Kevin', 'Lawrence', 'Leonard', 'Leslie', 'Lionel', 'Malcolm', 'Martin', 'Matthew', 'Maurice', 'Michael', 'Norman', 'Oliver', 'Oscar', 'Patrick', 'Paul', 'Peter', 'Philip', 'Quentin', 'Raymond', 'Richard', 'Robert', 'Roger', 'Ronald', 'Russell', 'Shawn', 'Simon', 'Spencer', 'Stanley', 'Stephen', 'Terence', 'Theodore', 'Timothy', 'Trevor', 'Victor', 'Vincent', 'Walter', 'Warren', 'Wesley', 'Wilson', 'Winston'],
    first_f: ['Alice', 'Amanda', 'Amelia', 'Angela', 'Annabelle', 'Audrey', 'Belinda', 'Bernice', 'Beatrice', 'Carmen', 'Caroline', 'Catherine', 'Cheryl', 'Christine', 'Cindy', 'Claire', 'Clara', 'Constance', 'Cynthia', 'Daphne', 'Deborah', 'Denise', 'Diana', 'Dorothy', 'Eileen', 'Elaine', 'Eleanor', 'Elizabeth', 'Emily', 'Esther', 'Eunice', 'Evelyn', 'Fiona', 'Florence', 'Geraldine', 'Gillian', 'Gloria', 'Grace', 'Hannah', 'Hazel', 'Helen', 'Ivy', 'Jacqueline', 'Jane', 'Janet', 'Jasmine', 'Jennifer', 'Jessica', 'Joanna', 'Joanne', 'Josephine', 'Joyce', 'Judith', 'Julia', 'Karen', 'Katherine', 'Kelly', 'Kimberly', 'Laura', 'Lydia', 'Mabel', 'Madeline', 'Marion', 'Mary', 'Megan', 'Melissa', 'Michelle', 'Miriam', 'Monica', 'Natalie', 'Nicole', 'Olivia', 'Pamela', 'Patricia', 'Pauline', 'Phoebe', 'Priscilla', 'Rachel', 'Rebecca', 'Regina', 'Rosalind', 'Ruth', 'Sabrina', 'Samantha', 'Sandra', 'Sarah', 'Serene', 'Sharon', 'Shirley', 'Sophia', 'Stephanie', 'Susan', 'Sylvia', 'Teresa', 'Tiffany', 'Valerie', 'Vanessa', 'Veronica', 'Victoria', 'Vivian', 'Wendy', 'Winnie', 'Yvonne'],
    // Romanised dialect surnames (role: surname, unisex)
    surname: ['Tan', 'Lim', 'Lee', 'Ng', 'Wong', 'Goh', 'Ong', 'Chua', 'Chan', 'Koh', 'Teo', 'Ang', 'Yeo', 'Tay', 'Ho', 'Low', 'Toh', 'Sim', 'Chong', 'Foo', 'Chia', 'Heng', 'Loh', 'Neo', 'Quek', 'Seah', 'Soh', 'Tham', 'Yap', 'Yip', 'Chew', 'Chin', 'Choo', 'Chow', 'Fong', 'Gan', 'Han', 'Hong', 'Huang', 'Kang', 'Kwok', 'Lai', 'Lau', 'Leong', 'Liang', 'Liew', 'Lin', 'Liu', 'Loke', 'Mok', 'Oh', 'Pang', 'Phua', 'Poh', 'Quah', 'See', 'Seet', 'Seow', 'Sng', 'Tng', 'Wee', 'Woo', 'Yong', 'Yuen', 'Cheng', 'Cheong', 'Chiang', 'Khoo', 'Kong', 'Lam', 'Lum', 'Mah', 'Ow', 'Png', 'Sia', 'Sin', 'Song', 'Tee', 'Wang', 'Wu', 'Xu', 'Yan', 'Yee', 'Boey', 'Yu', 'Zhang', 'Zhou', 'Zhu', 'Chye', 'Eng', 'Hoe', 'Kee', 'Lye', 'Nai', 'Ooi', 'Peh', 'Sau', 'Teoh', 'Thian', 'Yeoh'],
    // Romanised given-name syllables (role: syllable, unisex)
    syllable: ['Wei', 'Ming', 'Hui', 'Jun', 'Ling', 'Hao', 'Jie', 'Hong', 'Xin', 'Yi', 'Yong', 'Hua', 'Feng', 'Kai', 'Jia', 'Wen', 'Zhi', 'Cheng', 'Bin', 'Bo', 'Chen', 'Da', 'En', 'Fang', 'Fen', 'Guo', 'Han', 'Heng', 'Jin', 'Jing', 'Juan', 'Kang', 'Kun', 'Lei', 'Li', 'Lian', 'Liang', 'Min', 'Mei', 'Mu', 'Nan', 'Ning', 'Peng', 'Ping', 'Qian', 'Qing', 'Quan', 'Ren', 'Rong', 'Ru', 'Shan', 'Sheng', 'Shu', 'Si', 'Tao', 'Tian', 'Ting', 'Wan', 'Xiang', 'Xiao', 'Xiu', 'Xuan', 'Xue', 'Yang', 'Yao', 'Ye', 'Yin', 'Ying', 'Yu', 'Yuan', 'Yue', 'Yun', 'Zhen', 'Zheng', 'Zhong', 'An', 'Bao', 'Chang', 'Chao', 'Dong', 'Fu', 'Gang', 'Guang', 'Hai', 'Jian', 'Long', 'Mao', 'Nian', 'Shi', 'Shun', 'Tai', 'Wai', 'Xi', 'Zai', 'Cong', 'Dai', 'Hou', 'Luo', 'Pei'],
  },

  malay: {
    given_m: ['Muhammad', 'Ahmad', 'Mohamed', 'Danish', 'Irfan', 'Hakim', 'Haziq', 'Iskandar', 'Iqbal', 'Ismail', 'Ibrahim', 'Ridwan', 'Syafiq', 'Syahmi', 'Shahrul', 'Zulkifli', 'Zainal', 'Faizal', 'Faris', 'Fadhil', 'Hafiz', 'Harith', 'Haikal', 'Imran', 'Khairul', 'Luqman', 'Naufal', 'Nabil', 'Rahman', 'Rashid', 'Ridhwan', 'Rosli', 'Saiful', 'Shafiq', 'Sufian', 'Taufik', 'Umar', 'Wahid', 'Yusof', 'Zaki', 'Adam', 'Amir', 'Anwar', 'Ariff', 'Asyraf', 'Azhar', 'Azlan', 'Aziz', 'Daud', 'Hamzah', 'Hanif', 'Haris', 'Hassan', 'Hisham', 'Idris', 'Jalil', 'Jamal', 'Kamal', 'Latif', 'Mahmud', 'Malik', 'Mansor', 'Nasir', 'Othman', 'Qayyum', 'Razak', 'Shukri', 'Sulaiman', 'Talib', 'Wafiq', 'Yaakob', 'Zakaria', 'Aiman', 'Akmal', 'Arif', 'Azim', 'Danial', 'Ehsan', 'Fahmi', 'Firdaus', 'Hadi', 'Ilyas', 'Johan', 'Khalid', 'Marwan', 'Nazri', 'Shahir', 'Taufiq', 'Zikri', 'Ariffin', 'Azfar', 'Daniel', 'Hazwan', 'Izzat', 'Khairi', 'Naqib', 'Putera', 'Syed', 'Zhafran'],
    given_f: ['Nur', 'Siti', 'Aisyah', 'Farah', 'Nurul', 'Aqilah', 'Adriana', 'Alya', 'Amira', 'Anis', 'Damia', 'Dahlia', 'Diyana', 'Fatimah', 'Hani', 'Hanis', 'Hidayah', 'Iman', 'Insyirah', 'Khadijah', 'Liyana', 'Maisarah', 'Maryam', 'Nabila', 'Nadia', 'Najwa', 'Nasuha', 'Nazira', 'Sofia', 'Sumayyah', 'Syafiqah', 'Wardah', 'Zahra', 'Zaharah', 'Zulaikha', 'Adelia', 'Aida', 'Aleeya', 'Alia', 'Amani', 'Atikah', 'Azizah', 'Balqis', 'Batrisyia', 'Delisha', 'Erina', 'Farahin', 'Habibah', 'Halimah', 'Hafizah', 'Husna', 'Izyan', 'Jannah', 'Juwita', 'Kamariah', 'Latifah', 'Mahirah', 'Marsha', 'Nabilah', 'Nadhirah', 'Nazihah', 'Norashikin', 'Norhayati', 'Qistina', 'Rabiatul', 'Rahmah', 'Raihana', 'Rohana', 'Rosmah', 'Sakinah', 'Salmah', 'Sarah', 'Shahirah', 'Shazana', 'Sofea', 'Suhaila', 'Sumaiyah', 'Suriani', 'Wani', 'Yasmin', 'Zahirah', 'Zarina', 'Aifa', 'Camelia', 'Danisha', 'Elisa', 'Hawa', 'Annisa', 'Qaseh', 'Adawiyah', 'Azura', 'Dewi', 'Faizah', 'Hidayu', 'Izzah', 'Munirah', 'Nuraini', 'Putri', 'Shafia', 'Wahidah'],
    // Father's names (always a man's name); unisex w.r.t. the child's gender
    father: ['Salleh', 'Ahmad', 'Ismail', 'Ibrahim', 'Othman', 'Hassan', 'Hussein', 'Rahman', 'Abdullah', 'Yusof', 'Bakar', 'Osman', 'Karim', 'Latif', 'Razak', 'Samad', 'Sulaiman', 'Talib', 'Wahab', 'Zakaria', 'Aziz', 'Daud', 'Hamid', 'Hashim', 'Jalil', 'Kassim', 'Mansor', 'Mokhtar', 'Mustafa', 'Nordin', 'Rashid', 'Sani', 'Shaari', 'Taib', 'Yaakob', 'Zain', 'Zainuddin', 'Amin', 'Ariffin', 'Basri', 'Halim', 'Idris', 'Jamil', 'Kamarudin', 'Maarof', 'Noor', 'Omar', 'Rejab', 'Sidek', 'Tahir', 'Yunus', 'Zabidi', 'Bahar', 'Ghani', 'Harun', 'Johari', 'Kadir', 'Masri', 'Nasir', 'Roslan', 'Suratman', 'Yatim', 'Zulkarnain', 'Fauzi', 'Gani', 'Hamzah', 'Ishak', 'Jaafar', 'Kamal', 'Lokman', 'Mahmood', 'Rais', 'Sahari', 'Tarmizi', 'Wahid', 'Yahya', 'Zamri', 'Bahari', 'Ghazali', 'Saad', 'Salim', 'Sapuan', 'Wazir', 'Abas', 'Buang', 'Dollah', 'Embok', 'Hamzan', 'Jumat', 'Mat', 'Nayan', 'Pawi', 'Sahid', 'Taufek', 'Usop', 'Wagiman', 'Yacob', 'Zamani', 'Sariff'],
  },

  indian: {
    given_m: ['Arun', 'Kumar', 'Raj', 'Suresh', 'Muthu', 'Surya', 'Narayanan', 'Ramesh', 'Ganesh', 'Mahesh', 'Prakash', 'Vijay', 'Anand', 'Bala', 'Deepak', 'Dinesh', 'Gopal', 'Hari', 'Karthik', 'Krishnan', 'Manoj', 'Mohan', 'Nathan', 'Naveen', 'Prem', 'Rahul', 'Ravi', 'Sanjay', 'Saravanan', 'Selvam', 'Senthil', 'Shankar', 'Sivakumar', 'Sundar', 'Thiru', 'Vasanth', 'Velu', 'Vikram', 'Vimal', 'Aravind', 'Ashok', 'Balaji', 'Chandran', 'Eswaran', 'Gopinath', 'Harish', 'Jayaram', 'Kishore', 'Lakshman', 'Madhavan', 'Manickam', 'Murugan', 'Nagaraj', 'Palani', 'Perumal', 'Rajan', 'Rajendran', 'Vignesh', 'Ramasamy', 'Sathish', 'Shanmugam', 'Sivaraj', 'Tharun', 'Thanabalan', 'Vadivelu', 'Veeran', 'Venkatesan', 'Yogendran', 'Adithya', 'Bharath', 'Devan', 'Elango', 'Gokul', 'Indran', 'Jeevan', 'Kannan', 'Logan', 'Mani', 'Nirmal', 'Pandian', 'Rakesh', 'Sasi', 'Tamil', 'Uday', 'Varun', 'Vishnu', 'Yuvan', 'Aditya', 'Bhaskar', 'Chandru', 'Ganesan', 'Hemanth', 'Jagan', 'Kalai', 'Magesh', 'Naren', 'Prabhu', 'Sathyan', 'Theva', 'Vinod'],
    given_f: ['Priya', 'Kavitha', 'Devi', 'Lakshmi', 'Meena', 'Anitha', 'Bhavani', 'Deepa', 'Divya', 'Gayathri', 'Geetha', 'Indira', 'Janani', 'Kala', 'Kamala', 'Kanaga', 'Latha', 'Malar', 'Mala', 'Nalini', 'Nirmala', 'Padma', 'Parvathi', 'Pooja', 'Radha', 'Rani', 'Revathi', 'Saroja', 'Saraswathi', 'Selvi', 'Shanthi', 'Sumathi', 'Suganthi', 'Sujatha', 'Sunita', 'Usha', 'Valli', 'Vani', 'Vasanthi', 'Vidya', 'Yamuna', 'Aarthi', 'Ambika', 'Anjali', 'Bhuvana', 'Chitra', 'Dhanam', 'Ganga', 'Hema', 'Ilavarasi', 'Jaya', 'Kalpana', 'Komala', 'Lalitha', 'Maheswari', 'Manjula', 'Nithya', 'Pavithra', 'Rajeswari', 'Ramya', 'Sangeetha', 'Shalini', 'Sripriya', 'Subha', 'Tamilarasi', 'Uma', 'Vennila', 'Vijaya', 'Anu', 'Bhargavi', 'Chandra', 'Durga', 'Esha', 'Gowri', 'Harini', 'Indu', 'Jeya', 'Kamatchi', 'Leela', 'Mythili', 'Nandini', 'Pushpa', 'Roja', 'Sandhya', 'Sharmila', 'Sneha', 'Thara', 'Uthra', 'Vaishnavi', 'Vimala', 'Aishwarya', 'Bhagya', 'Deepika', 'Gita', 'Iniya', 'Jothi', 'Kayal', 'Malini', 'Sasikala', 'Thenmozhi'],
    father: ['Kumar', 'Suppiah', 'Nagaratnam', 'Rajagopal', 'Narayanan', 'Ramasamy', 'Krishnan', 'Perumal', 'Muthusamy', 'Sivasamy', 'Veerasamy', 'Arumugam', 'Dhanabalan', 'Ganesan', 'Jayaraman', 'Kandasamy', 'Lakshmanan', 'Nadarajah', 'Palanisamy', 'Pillai', 'Rajaratnam', 'Ramalingam', 'Sankaran', 'Sathasivam', 'Selvaraj', 'Shanmugam', 'Sivanandam', 'Thangavelu', 'Thirumalai', 'Vairavan', 'Velayudham', 'Annamalai', 'Ayyappan', 'Bhaskaran', 'Elangovan', 'Jeyaratnam', 'Kaliappan', 'Karuppiah', 'Maniam', 'Marimuthu', 'Murugaiah', 'Ponnusamy', 'Rajamani', 'Sabapathy', 'Sellappan', 'Singaram', 'Sundaram', 'Vadivelu', 'Anbalagan', 'Boopathy', 'Chinnasamy', 'Devadas', 'Kuppusamy', 'Mahalingam', 'Natarajan', 'Periasamy', 'Ragunathan', 'Sivakumar', 'Thandapani', 'Varadan', 'Yogarajah', 'Alagappan', 'Chellappa', 'Doraisamy', 'Munusamy', 'Vetrivel', 'Arokiasamy', 'Devarajan', 'Kandiah', 'Manoharan', 'Pakirisamy', 'Rasiah', 'Sinniah', 'Thambusamy', 'Veerappan', 'Aiyappan', 'Madasamy', 'Naidu', 'Reddy', 'Menon', 'Nair', 'Sharma', 'Iyer', 'Raju', 'Babu', 'Nayar', 'Achari', 'Gounder', 'Naicker', 'Chettiar', 'Thevar', 'Nadar', 'Mudaliar', 'Konar', 'Udayar', 'Maistry', 'Murthy', 'Shetty', 'Kamath', 'Nayak'],
  },

  eurasian: {
    // Christian given names; these double as middle names (roles: first + middle)
    first_m: ['Michael', 'John', 'Anthony', 'Joseph', 'Francis', 'Gerald', 'Bernard', 'Clifford', 'Desmond', 'Lawrence', 'Patrick', 'Vincent', 'Wilfred', 'Aloysius', 'Andrew', 'Augustine', 'Benedict', 'Bertram', 'Chris', 'Cuthbert', 'Cyril', 'Damien', 'Dominic', 'Edgar', 'Edmund', 'Edward', 'Felix', 'Ferdinand', 'Frederick', 'Gabriel', 'George', 'Gilbert', 'Gregory', 'Harold', 'Hubert', 'Ignatius', 'Isaac', 'Jerome', 'Julian', 'Leonard', 'Leopold', 'Lucas', 'Luke', 'Marcus', 'Mark', 'Martin', 'Matthias', 'Maurice', 'Maximilian', 'Nicholas', 'Noel', 'Oswald', 'Percival', 'Peter', 'Philip', 'Quentin', 'Raphael', 'Raymond', 'Reginald', 'Rudolph', 'Sebastian', 'Stephen', 'Sylvester', 'Theodore', 'Thomas', 'Valentine', 'Victor', 'Walter', 'Xavier', 'Adrian', 'Albert', 'Alexander', 'Allan', 'Bart', 'Casimir', 'Clarence', 'Clement', 'Conrad', 'Cornelius', 'Crispin', 'Eugene', 'Fabian', 'Gerard', 'Hilary', 'Horace', 'Humphrey', 'Ivan', 'Lionel', 'Malcolm', 'Norbert', 'Oscar', 'Roderick', 'Roland', 'Rowland', 'Terence', 'Urban', 'Wilbert', 'Aldrin', 'Brendan', 'Lucius'],
    first_f: ['Maria', 'Theresa', 'Agnes', 'Cecilia', 'Bernadette', 'Clara', 'Dorothy', 'Eunice', 'Felicia', 'Genevieve', 'Gertrude', 'Hortense', 'Imelda', 'Josephine', 'Juliana', 'Lucia', 'Magdalene', 'Margaret', 'Martina', 'Monica', 'Patricia', 'Philomena', 'Regina', 'Rosalind', 'Rosemary', 'Sabrina', 'Sylvia', 'Theodora', 'Ursula', 'Veronica', 'Vivienne', 'Winifred', 'Adelaide', 'Angelina', 'Annette', 'Antonia', 'Augustina', 'Bernice', 'Brigitte', 'Carmelita', 'Caroline', 'Catherine', 'Charlotte', 'Christabel', 'Clarissa', 'Claudia', 'Clementine', 'Constance', 'Cornelia', 'Delphine', 'Dominica', 'Eleanor', 'Elvira', 'Emelda', 'Esmeralda', 'Eugenia', 'Evangeline', 'Florentina', 'Francesca', 'Gabriella', 'Georgina', 'Gloria', 'Henrietta', 'Hyacinth', 'Isabella', 'Jacinta', 'Johanna', 'Leonora', 'Lourdes', 'Madeleine', 'Marcella', 'Marguerite', 'Marianne', 'Marlene', 'Mathilda', 'Melanie', 'Nadine', 'Natalia', 'Octavia', 'Olga', 'Pauline', 'Perpetua', 'Priscilla', 'Rafaela', 'Rita', 'Romana', 'Rosario', 'Seraphina', 'Sophia', 'Stephanie', 'Teresa', 'Valentina', 'Valeria', 'Vera', 'Wilhelmina', 'Yolanda', 'Adriana', 'Beatrix', 'Celestine', 'Lucille'],
    // Portuguese / Dutch / British Eurasian surnames (role: surname, unisex)
    surname: ['Pereira', 'de Souza', 'Theseira', 'de Silva', 'Oliveiro', 'Aeria', 'Klyne', 'Minjoot', 'Almeida', 'Carvalho', 'de Costa', 'de Cruz', 'Gomes', 'Lazaroo', 'Lopez', 'Machado', 'de Mello', 'Monteiro', 'Nonis', 'Nunis', 'Pestana', 'Pinto', 'Rodrigues', 'Rozario', 'Sequerah', 'Skelchy', 'Vaas', 'Xavier', 'Cardoza', 'Fernandez', 'Fernando', 'Dias', 'Ferrao', 'Sequeira', 'de Rozario', 'Clarke', 'Woodford', 'Leicester', 'Shepherd', 'Eber', 'Aroozoo', 'Tessensohn', 'Westerhout', 'Hendricks', 'Holloway', 'Cordeiro', 'Restall', 'Rozells', 'Anthonisz', 'Baptist', 'Bostock', 'Conceicao', 'Danker', 'Desker', 'Doray', 'Frois', 'Gracie', 'Hertogh', 'Jansen', 'Joaquim', 'Koek', 'La Brooy', 'Lazarus', 'Maddever', 'Marbeck', 'Martens', 'Neubronner', 'Oehlers', 'Ollero', 'Paglar', 'Perera', 'Phillips', 'Picardo', 'Pohl', 'Reutens', 'Rodyk', 'Scully', 'Siebel', 'Spykerman', 'Tavares', 'Toomey', 'Boudville', 'Verghese', 'Verloop', 'Cornelius', 'de Wit', 'Edwards', 'Hyde', 'Lourdes', 'Maximus', 'Netto', 'Olivero', 'Quadra', 'Remedios', 'Salgado', 'Texeira', 'Vandenberg', 'Wilkinson', 'Young', 'Zuzarte'],
  },
};

// Singapore PayNow-participating banks (for the receipt chrome).
export const BANKS = [
  'DBS Bank', 'POSB', 'UOB', 'OCBC Bank', 'Standard Chartered',
  'Maybank', 'Citibank', 'HSBC', 'Bank of China', 'ICBC',
];

// Expand RAW string lists into Part records: { text, race, gender, roles }.
function buildParts() {
  const parts = [];
  const add = (texts, race, gender, roles) => {
    for (const text of texts) parts.push({ text, race, gender, roles });
  };

  add(RAW.chinese.first_m, 'chinese', 'm', ['first']);
  add(RAW.chinese.first_f, 'chinese', 'f', ['first']);
  add(RAW.chinese.surname, 'chinese', 'u', ['surname']);
  add(RAW.chinese.syllable, 'chinese', 'u', ['syllable']);

  add(RAW.malay.given_m, 'malay', 'm', ['given']);
  add(RAW.malay.given_f, 'malay', 'f', ['given']);
  add(RAW.malay.father, 'malay', 'u', ['father']);

  add(RAW.indian.given_m, 'indian', 'm', ['given']);
  add(RAW.indian.given_f, 'indian', 'f', ['given']);
  add(RAW.indian.father, 'indian', 'u', ['father']);

  // Eurasian first names double as middle names.
  add(RAW.eurasian.first_m, 'eurasian', 'm', ['first', 'middle']);
  add(RAW.eurasian.first_f, 'eurasian', 'f', ['first', 'middle']);
  add(RAW.eurasian.surname, 'eurasian', 'u', ['surname']);

  // Assign stable ids.
  parts.forEach((p, i) => { p.id = `${p.race}:${i}:${p.text}`; });
  return parts;
}

export const PARTS = buildParts();

// Name structures. Slot kinds:
//   { kind:'part', role }          -> draw a Part of (race, role, gender-compatible)
//   { kind:'token', text }         -> fixed connector, shown but not guessed
//                                     ('bin' auto-swaps to 'binti' for female)
//   { kind:'initial' }             -> single random A-Z letter, locked/shown
const P = (role) => ({ kind: 'part', role });
const T = (text) => ({ kind: 'token', text });
const I = () => ({ kind: 'initial' });

export const STRUCTURES = [
  // ---- EASY ----
  // Chinese: David Tan
  { id: 'cn-e1', race: 'chinese', mode: 'easy', slots: [P('first'), P('surname')] },
  // Eurasian: Michael Pereira
  { id: 'eu-e1', race: 'eurasian', mode: 'easy', slots: [P('first'), P('surname')] },
  // Malay: Nur Aisyah Salleh / Ahmad Salleh
  { id: 'my-e1', race: 'malay', mode: 'easy', slots: [P('given'), P('given'), P('father')] },
  { id: 'my-e2', race: 'malay', mode: 'easy', slots: [P('given'), P('father')] },
  // Indian: Arun Kumar
  { id: 'in-e1', race: 'indian', mode: 'easy', slots: [P('given'), P('father')] },

  // ---- HARD ----
  // Chinese: David Tan Wei Meng
  { id: 'cn-h1', race: 'chinese', mode: 'hard', slots: [P('first'), P('surname'), P('syllable'), P('syllable')] },
  { id: 'cn-h2', race: 'chinese', mode: 'hard', slots: [P('surname'), P('syllable'), P('syllable'), P('first')] },
  // Eurasian: John Michael Anthony Pereira
  { id: 'eu-h1', race: 'eurasian', mode: 'hard', slots: [P('first'), P('middle'), P('middle'), P('surname')] },
  { id: 'eu-h2', race: 'eurasian', mode: 'hard', slots: [P('first'), P('middle'), P('surname')] },
  // Indian: S Rajagopalan Narayanan
  { id: 'in-h1', race: 'indian', mode: 'hard', slots: [I(), P('given'), P('father')] },
  { id: 'in-h2', race: 'indian', mode: 'hard', slots: [I(), I(), P('given'), P('father')] },
  { id: 'in-h3', race: 'indian', mode: 'hard', slots: [P('given'), P('given'), P('father')] },
  // Malay: Muhammad Danish Irfan bin Ahmad
  { id: 'my-h1', race: 'malay', mode: 'hard', slots: [P('given'), P('given'), P('given'), T('bin'), P('father')] },
  { id: 'my-h2', race: 'malay', mode: 'hard', slots: [P('given'), P('given'), T('bin'), P('father')] },
];
