/*
 * QDigiDocClient
 *
 * Copyright (C) 2009 Jargo K�ster <jargo@innovaatik.ee>
 * Copyright (C) 2009 Raul Metsma <raul@innovaatik.ee>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 *
 */

#pragma once

#include <QTreeWidget>
#include <QFile>
//#include "Document.h"
#include "SafetDocument.h"


//namespace digidoc { class Document; }

class QUrl;

class TreeWidget : public QTreeWidget
{
	Q_OBJECT
public:
    TreeWidget( QWidget *parent = 0 );

        //void setContent( const QList<digidoc::Document> &docs );
        // agregada funcion para eliminar dependencia de digidicpp
        void setContent( SafetDocument doc );
        static QString fileSize( quint64 bytes );

        QString getRuta() {return ruta;}

Q_SIGNALS:
	void remove( unsigned int id );
	void save( unsigned int id, const QString &filepath );
        void save( int id, const QString filepath, SafetDocument doc );

private Q_SLOTS:
	void clicked( const QModelIndex &index );
	void openFile( const QModelIndex &index );

private:
	void keyPressEvent( QKeyEvent *e );
	QMimeData* mimeData( const QList<QTreeWidgetItem*> items ) const;
	QStringList mimeTypes() const;
	Qt::DropActions supportedDropActions() const;
	QUrl url( const QModelIndex &item ) const;

        QString ruta;
};
