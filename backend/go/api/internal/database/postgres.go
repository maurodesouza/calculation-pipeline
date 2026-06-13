package database

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DatabaseConnection struct {
	User     string
	Password string
	Host     string
	Port     string
	DBName   string
}

type Database struct {
	DatabaseConnection

	Pool *pgxpool.Pool
}

func NewDatabase(connection DatabaseConnection) *Database {
	return &Database{
		DatabaseConnection: connection,
	}
}

func (d *Database) Connect() (*pgxpool.Pool, error) {
	dsn := "postgres://" + d.User + ":" + d.Password + "@" + d.Host + ":" + d.Port + "/" + d.DBName

	var err error
	d.Pool, err = pgxpool.New(context.Background(), dsn)

	if err != nil {
		return nil, err
	}

	fmt.Println("[database]: connected successfully")

	return d.Pool, nil
}

func (d *Database) Disconnect() error {
	d.Pool.Close()
	fmt.Println("[database]: disconnected successfully")
	return nil
}
