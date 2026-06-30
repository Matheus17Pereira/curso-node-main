import mongoose from 'mongoose';

const tarefaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, "O campo título é obrigatório."],
        minlength: [3, "O título deve ter no mínimo 3 caracteres."]
    },
    concluida: {
        type: Boolean,
        default: false
    },
    prioridade: {
        type: String,
        required: true,
        enum: ["Baixa", "Média", "Alta"],
        default: "Baixa"
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, { timestamps: true });

const Tarefa = mongoose.model('Tarefa', tarefaSchema);

export default Tarefa;