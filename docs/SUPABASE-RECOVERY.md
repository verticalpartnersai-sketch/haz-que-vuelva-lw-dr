# Recuperação do Supabase

Este runbook cobre backup lógico criptografado e restauração em um projeto
isolado. Ele não autoriza restauração destrutiva sobre produção.

## Limites do backup

O backup lógico oficial separa roles, schema e dados. Ele preserva tabelas,
funções, políticas, triggers e registros de autenticação incluídos pelo fluxo
do Supabase CLI, mas não copia os objetos binários do Storage. Configurações de
Auth, chaves, DNS, Edge Functions e secrets também precisam de inventário e
recriação separados.

Para projetos pagos com backup físico, o caminho preferido para um drill é
**Database > Backups > Restore to a New Project**. A clonagem continua exigindo
reconfiguração manual e cópia dos objetos do Storage.

## Criar backup lógico criptografado

Pré-condições:

- Docker ativo, porque `supabase db dump` usa uma imagem Postgres;
- connection string direta ou Session pooler contendo o project ref;
- passphrase guardada fora do repositório;
- destino absoluto fora do checkout e em volume criptografado.

```bash
export HQV_DATABASE_URL='postgresql://...?...sslmode=require'
export HQV_BACKUP_PASSPHRASE='uma passphrase longa armazenada no cofre'
scripts/supabase-backup.sh /volume-seguro/hqv-2026-07-31.tar.gz.gpg
```

O script:

1. recusa URL de outro projeto, destino dentro do Git e sobrescrita;
2. gera `roles.sql`, `schema.sql` e `data.sql` pelo Supabase CLI fixado;
3. gera manifesto e checksums;
4. cifra e autentica o pacote com GnuPG/AES-256 antes de movê-lo ao destino;
5. imprime somente caminho e SHA-256, nunca a connection string.

## Validar e restaurar em projeto isolado

A validação padrão não abre conexão:

```bash
export HQV_BACKUP_PASSPHRASE='a mesma passphrase'
scripts/supabase-restore.sh \
  /volume-seguro/hqv-2026-07-31.tar.gz.gpg \
  ref-do-projeto-isolado
```

Para executar a restauração:

```bash
export HQV_RESTORE_DATABASE_URL='postgresql://...?...sslmode=require'
export HQV_RESTORE_CONFIRM='RESTORE:<sha256>:<ref-do-projeto-isolado>'
scripts/supabase-restore.sh \
  /volume-seguro/hqv-2026-07-31.tar.gz.gpg \
  ref-do-projeto-isolado \
  --execute
```

O executor recusa o project ref de produção, URL sem TLS, destino que já
contenha o schema HQV, pacote alterado ou confirmação divergente. Após o
restore, confirma a presença das relações críticas. O drill só termina depois
dos testes pgTAP, de autenticação, entitlement, download e isolamento.

## Storage

Backup do banco contém metadados de buckets e objetos, não os arquivos. Antes
de publicar conteúdo, definir e testar um segundo processo que:

1. enumere objetos e versões no bucket privado;
2. copie os binários para armazenamento externo cifrado;
3. registre bucket, key, tamanho, ETag e checksum sem URL assinada;
4. restaure em um bucket de teste;
5. compare manifesto e confirme que uma conta não autorizada continua negada.

## Evidência e política inicial

- RPO inicial proposto: 24 horas; reduzir antes de volume comercial relevante.
- RTO inicial proposto: 4 horas, sujeito ao primeiro drill cronometrado.
- retenção proposta: 7 diários, 4 semanais e 3 mensais, todos cifrados.
- nunca anexar dumps a GitHub Actions ou commits.
- registrar somente SHA-256, horário, duração, resultado e contagens redigidas.
- manter a chave de backup em um cofre diferente do local do backup.

RPO, RTO e retenção só se tornam compromissos depois da aprovação operacional
e de um restore completo cronometrado.
