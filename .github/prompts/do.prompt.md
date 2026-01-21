---
agent: agent
tools:
  [
    'execute',
    'read',
    'edit',
    'web',
    'io.github.upstash/context7/*',
    'agent',
    'todo',
  ]
---

Este projeto consiste de um monorepo com backend Nestjs e frontend Nextjs, seguindo os requisitos técnicos e entregáveis especificados no arquivo [todo/TODO.md](../../todo/TODO.md).
Use a tool #tool:io.github.upstash/context7/resolve-library-id e #tool:io.github.upstash/context7/get-library-docs para consultar a documentação oficial.
Use a tool #tool:todo para planejar/criar/ler suas tarefas.
Faça apenas o que foi pedido e siga fielmente as instruções.
Não insista no erro: pare e peça orientações se não conseguir progredir.
Se existe um meio oficial de fazer algo, use-o.
Não adicione código ou funcionalidades extras que não foram solicitadas.
Antes de começar, descreva brevemente seu plano para completar a tarefa.
Jamais utilize diretivas para ignorar erros ou falhas de compilação.
Jamais utilize double casting (ex: value as unknown as Type).
Jamais utilize "any" em TypeScript.
Restrinja-se ao que pede [todo/TODO.md](../../todo/TODO.md).
Prefira o simples ao complexo. Prefira soluções diretas e óbvias.
Documente e mantenha o código atualizado através de comentários TSDoc.
Se completou alguma checkbox em [todo/TODO.md](../../todo/TODO.md), atualize o arquivo imediatamente.
