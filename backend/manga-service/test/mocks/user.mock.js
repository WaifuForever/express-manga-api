const scan = {
    email: `${process.env.TEST_GMAIL}`,
    password: `${process.env.TEST_GMAIL_PASS}`,
    active: false,
    name: 'Jojo',
    role: 'Scan',
    _id: '',
    token: '',
};
const user = {
    email: 'as' + `${process.env.TEST_GMAIL}`,
    password: `${process.env.TEST_GMAIL_PASS}`,
    active: false,
    name: 'Seth',
    role: 'User',
    _id: '',
    token: '',
};

const fake_user = {
    email: `25 + ${process.env.TEST_GMAIL}`,
    password: `${process.env.TEST_GMAIL_PASS_2}`,
    name: 'Matt',
    role: 'd2asadn',
};
export { user, scan, fake_user };
