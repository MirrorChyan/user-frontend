import { CLIENT_BACKEND } from "@/app/requests/misc";

export const QQ_GROUP = "https://qm.qq.com/cgi-bin/qm/qr?k=tEmwz6tg9LJnHswOAGNcrBAESCIa1ju3&jump_from=webapi&authKey=8sOfUTnv02S1Cdm/KtdBz6GnPdpx4qXnLspeH48IIvFGChSte4V8C7NNkZ8i4/ra"


export const getGroupUrl = async () => {
  try {
    const resp = await fetch(`${CLIENT_BACKEND}/api/misc/contact_us`);
    if (resp.ok) {
      const { QQGroupLink } = (await resp.json()).data;
      return QQGroupLink
    }
  } catch (e) {
    console.log(e)
  }
  return QQ_GROUP
}
