import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

interface Data {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    login, // '45568413543'
    password, // '455684135431105'
    loginType // '2'
  } = req.body;
  const jar = new CookieJar();
  const baseURL = 'https://cvccorp.nexusweb.com.br';
  const captchaUrl = '/captcha.asp';

  const client = wrapper(axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    withCredentials: true,
    jar
  }));

  try {
    await client.get('/captcha.asp');
    const cookies = jar.getCookiesSync(baseURL + captchaUrl);
    const captcha = cookies.find((c) => c.key === 'ASPCAPTCHA')?.value;

    const payload = new URLSearchParams({
      acao: '1',
      txtValor: login,
      txtSenha: password,
      cboCampo: loginType,
      chkAdicPer: '1',
      chkAdicIns: '1',
      chkAdicEmb: '1',
      captchacode: captcha,
      cboLocal: '6055',
    } as any);

    const { data, ...rest } = await client.post('/default.asp', payload);
    res.status(rest.status).json(data);
  } catch (error) {
    res.status(500).json(error as Data);
  }
}
