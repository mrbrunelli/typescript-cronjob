interface OcorrenciaArrayResponse {
    idOcorrencia: number,
    data: string,
    comentario: string,
    tipoOcorrencia: {
        codigo: number,
        nome: string,
    },
    embarque: {
        idEmbarque: number,
        numero: string,
        chave: string,
        dataCriacao: string,
        dataEmbarque: string,
        dataEmissao: string,
        dataPrevisao: string
        statusEmbarque: {
            nome: string
        },
        destinatario: {
            idDestinatario: number,
            nome: string,
            cnpj: string,
            celular: string,
            email: string,
            endereco: {
                idEndereco: number,
                cidade: string,
                uf: string
            }
        },
        transportadora: {
            idTransportadora: number,
            cnpj: string,
            nome: string
        },
        pedido: {
            idPedido: number,
            numero: string,
            dataEmissao: string,
            dataCriacao: string,
            dataAgendamento: string
        },
        embarcador: {
            idEmbarcador: number,
            cnpj: string,
            nome: string
        },
        entregas: [
            {
                idEntrega: number,
                dataEntrega: string,
                dataCriacao: string
            }
        ]
    }
}

export default OcorrenciaArrayResponse