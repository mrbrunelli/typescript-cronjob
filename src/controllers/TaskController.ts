import Email from './EmailController'
import Ocorrencia from './OcorrenciaController'

const email = new Email()

class Task extends Ocorrencia {
    constructor() {
        super()
    }

    async executeTasks() {
        this.loginApi()
            .then(() => {
                if (this.error) return email.sendEmail(this.message)

                console.log(`--> ${this.message}`)

                this.listAllOcorrencias()
                    .then(() => {
                        if (this.error) return email.sendEmail(this.message)

                        console.log(`--> ${this.message}`)

                        this.registerOcorrencias()
                            .then(() => {
                                if (this.error) return email.sendEmail(this.message)

                                console.log(`--> ${this.message}`)
                            })
                    })
            })

    }
}

export default Task