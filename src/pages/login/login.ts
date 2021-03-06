import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { HttpProvider } from './../../providers/http/http';
import { Component } from '@angular/core';
import { IonicPage, LoadingController, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public usuario = {
    payload : {
      email : null,
      password : null,
      serviceId : 438
    }
  }

  constructor(
    private http: HttpProvider,
    private Mensagem: MensagemProvider,
    private loadingCtrl: LoadingController,
    private ViewController:ViewController
  ) {

  }

  login(){
    let loading = this.loadingCtrl.create({ content: 'Por favor aguarde...' });
    loading.present();

    this.http.getApiPost('api/authentication', this.usuario).subscribe(response => {
      let resposta = JSON.parse(JSON.stringify(response));
      if(resposta.glbId)
      {
        localStorage.setItem('token', resposta.glbId);
        localStorage.setItem('token_meu_time', resposta.glbId);
        this.Mensagem.mensagem('Sucesso', resposta.userMessage);
      }
      this.ViewController.dismiss(resposta.glbId);
      loading.dismiss();
    }, err => {
      loading.dismiss();
      this.Mensagem.mensagem('Atenção', 'Só é possível logar usando a conta do Globo Esporte!');
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

}
