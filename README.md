# Heimdall

Create a credentials file at `~/.aws/credentials` on Mac/Linux or `C:\Users\USERNAME\.aws\credentials` on Windows

```ini
[default]

aws_access_key_id = your_access_key
aws_secret_access_key = your_secret_key
```

Or directly in your console:

```sh
AWS_ACCESS_KEY_ID=your_access_key \
AWS_SECRET_ACCESS_KEY=your_secret_key \
heimdall-s3 COMMAND [ARGS] [OPTIONS]
```

## Install

Just use `npm`

```sh
npm install -g heimdall-s3
```

## History

```sh
./heimdall-s3 history my/path/to/file.txt --region eu-west-1 --bucket my.bucket.org
```

The output is something like:

```sh
 #   Rev               Date                                      Path
 0   xxxxxxxxxxxxxx1   Thu Feb 18 2016 20:01:24 GMT+0100 (CET)   path/to/file.xml
 1   xxxxxxxxxxxxxx2   Thu Feb 18 2016 14:21:05 GMT+0100 (CET)   path/to/file.xml
```

## Revision

You can select a particular revision

```sh
./heimdall-s3 revision my/path/to/file.txt \
    --version d5s92Db30MRPNllR2WRspKKs12sfasSK \
    --region eu-west-1 --bucket my.bucket.org
```

Or directly the latest revision

```sh
./heimdall-s3 revision my/path/to/file.txt \
    --region eu-west-1 --bucket my.bucket.org
```

### Save to file

Just use the shell

```sh
./heimdall-s3 revision my/path/to/file.txt \
    --region eu-west-1 --bucket my.bucket.org > file.txt
```

## Download all revisions

We have a bifrost!

```sh
./heimdall-s3 bifrost my/path/to/file.txt \
    --region eu-west-1 --bucket my.bucket.org \
    --path /tmp
```

With the `path` option you can download all revision in a specific folder,
otherwise the current folder is used.


