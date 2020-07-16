import * as dotenv from 'dotenv'
import db from '../config/database'
import axios, { AxiosPromise, AxiosResponse, AxiosRequestConfig } from 'axios'
import LoginResponse from '../interfaces/LoginResponse'
import OcorrenciaResponse from '../interfaces/OcorrenciaResponse'
import OcorrenciaArrayResponse from '../interfaces/OcorrenciaArrayResponse'
import SqlError from '../enums/SqlError'
import { format, subDays } from 'date-fns'

dotenv.config()

class Ocorrencia {
    private _email!: any
    private _senha!: any
    private _body!: {}
    private _token!: string
    private _queryParams!: string
    private _header!: {}
    private _ocorrencias!: OcorrenciaArrayResponse[]
    private _error!: boolean
    private _message!: string
    private _date!: any
    private _page!: number
    private _total!: any

    constructor() {
        this.date = new Date()
        this.error = false
        //this.header = { headers: { authorization: 'fe61c468-43cb-42bd-bfc2-46ac6270f235' } }
        this.page = 0
        this.queryParams = `de=${encodeURIComponent(this.date)}&tipoData=OCORRENCIA&codigoOcorrencia=19&page=${this.page}`
        this.email = process.env.GKO_EMAIL
        this.senha = process.env.GKO_SENHA
        this.body = { email: this.email, senha: this.senha }
        this.ocorrencias = []
    }

    async loginApi() {
        try {
            const response = await axios.post<LoginResponse>('http://utilities.confirmafacil.com.br/login/login', this.body)
            this.header = { headers: { authorization: response.data.resposta.token } }
        } catch (err) {
            this.error = true
            this.message = err
        }

        if (!this.error) return this.message = 'Login realizado com sucesso! Token registrado!'

    }

    async listAllOcorrencias() {
        try {
            const totalOcorrenciaResponse = await axios.get<OcorrenciaResponse>(`http://utilities.confirmafacil.com.br/filter/ocorrencia?${this.queryParams}`, this.header)
            this.total = totalOcorrenciaResponse.data.totalCount

            console.log(`--> Total de ocorrências: ${totalOcorrenciaResponse.data.totalCount}`)
            for (let i = 0; i < this.total; i++) {
                this.page = i
                this.queryParams = `de=${encodeURIComponent(this.date)}&tipoData=OCORRENCIA&codigoOcorrencia=19&page=${this.page}`
                const ocorrenciaResponse = await axios.get(`http://utilities.confirmafacil.com.br/filter/ocorrencia?${this.queryParams}`, this.header)

                this.ocorrencias.push(...ocorrenciaResponse.data.respostas)

                console.log(`--> Buscando página: ${this.page}`)
            }

        } catch (err) {
            this.error = true
            this.message = err
        }

        if (!this.error) return this.message = 'Ocorrências listadas. Aguardando registro no banco...'
    }

    async registerOcorrencias() {

        for (let o of this.ocorrencias) {

            if (this.error) break

            try {
                await db.query(`
                        INSERT INTO ocorrencia (
                        ocorrencia_id,
                        ocorrencia_data,
                        ocorrencia_comentario,
                        ocorrencia_codigo,
                        ocorrencia_nome,
                        embarque_id,
                        embarque_numero,
                        embarque_chave,
                        embarque_data_criacao,
                        embarque_data_emissao,
                        embarque_data_embarque,
                        embarque_data_previsao,
                        embarque_status,
                        destinatario_id,
                        destinatario_nome,
                        destinatario_cnpj,
                        destinatario_celular,
                        destinatario_cidade,
                        destinatario_uf,
                        destinatario_endereco_id,
                        transportadora_id,
                        transportadora_cnpj,
                        transportadora_nome,
                        pedido_id,
                        pedido_numero,
                        pedido_data_emissao,
                        pedido_data_criacao,
                        pedido_data_agendamento,
                        embarcador_id,
                        embarcador_cnpj,
                        embarcador_nome,
                        entrega_id,
                        entrega_data_criacao,
                        entrega_data_entrega
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 
                        $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
                        $25, $26, $27, $28, $29, $30, $31, $32, $33, $34
                    )`,
                    [
                        o.idOcorrencia,
                        o.data,
                        o.comentario,
                        o.tipoOcorrencia.codigo,
                        o.tipoOcorrencia.nome,
                        o.embarque.idEmbarque,
                        o.embarque.numero,
                        o.embarque.chave,
                        o.embarque.dataCriacao,
                        o.embarque.dataEmissao,
                        o.embarque.dataEmbarque,
                        o.embarque.dataPrevisao,
                        o.embarque.statusEmbarque?.nome,
                        o.embarque.destinatario?.idDestinatario,
                        o.embarque.destinatario?.nome,
                        o.embarque.destinatario?.cnpj,
                        o.embarque.destinatario?.celular,
                        o.embarque.destinatario?.endereco.cidade,
                        o.embarque.destinatario?.endereco.uf,
                        o.embarque.destinatario?.endereco.idEndereco,
                        o.embarque.transportadora?.idTransportadora,
                        o.embarque.transportadora?.cnpj,
                        o.embarque.transportadora?.nome,
                        o.embarque.pedido?.idPedido,
                        o.embarque.pedido?.numero,
                        o.embarque.pedido?.dataEmissao,
                        o.embarque.pedido?.dataCriacao,
                        o.embarque.pedido?.dataAgendamento,
                        o.embarque.embarcador?.idEmbarcador,
                        o.embarque.embarcador?.cnpj,
                        o.embarque.embarcador?.nome,
                        o.embarque.entregas[0]?.idEntrega,
                        o.embarque.entregas[0]?.dataCriacao,
                        o.embarque.entregas[0]?.dataEntrega
                    ]
                )
            } catch (err) {
                if (err.code != SqlError.CONSTRAINT_ERROR) {
                    this.error = true
                    this.message = err
                }
            }
        }

        if (!this.error) return this.message = 'Ocorrências cadastradas com sucesso!'

    }

    get total(): any {
        return this._total
    }

    set total(total: any) {
        total = total < 10 ? 1 : total / 10
        total = parseInt(total)
        this._total = total + 1
    }

    get page(): number {
        return this._page
    }

    set page(page: number) {
        this._page = page
    }

    get date(): any {
        return this._date
    }

    set date(date: any) {
        date = subDays(date, 7)
        date = format(date, 'yyyy/MM/dd HH:mm:ss')
        this._date = date
    }

    get error(): boolean {
        return this._error
    }

    set error(error: boolean) {
        this._error = error
    }

    get message(): string {
        return this._message
    }

    set message(message: string) {
        this._message = message
    }

    get ocorrencias(): OcorrenciaArrayResponse[] {
        return this._ocorrencias
    }

    set ocorrencias(ocorrencias: OcorrenciaArrayResponse[]) {
        this._ocorrencias = ocorrencias
    }

    get header(): {} {
        return this._header
    }

    set header(header: {}) {
        this._header = header
    }

    set queryParams(queryParams: string) {
        this._queryParams = queryParams
    }

    get queryParams(): string {
        return this._queryParams
    }

    set token(token: string) {
        this._token = token
    }

    get token(): string {
        return this._token
    }

    get body(): {} {
        return this._body
    }

    set body(body: {}) {
        this._body = body
    }

    get email(): any {
        return this._email
    }

    set email(email: any) {
        this._email = email
    }

    get senha(): any {
        return this._senha
    }

    set senha(senha: any) {
        this._senha = senha
    }
}

export default Ocorrencia
