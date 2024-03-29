/****************************************************************************
 **
 ** Copyright (C) 2008 Nokia Corporation and/or its subsidiary(-ies).
 ** Contact: Qt Software Information (qt-info@nokia.com)
 **
 ** This file is part of the example classes of the Qt Toolkit.
 **
 ** Commercial Usage
 ** Licensees holding valid Qt Commercial licenses may use this file in
 ** accordance with the Qt Commercial License Agreement provided with the
 ** Software or, alternatively, in accordance with the terms contained in
 ** a written agreement between you and Nokia.
 **
 **
 ** GNU General Public License Usage
 ** Alternatively, this file may be used under the terms of the GNU
 ** General Public License versions 2.0 or 3.0 as published by the Free
 ** Software Foundation and appearing in the file LICENSE.GPL included in
 ** the packaging of this file.  Please review the following information
 ** to ensure GNU General Public Licensing requirements will be met:
 ** http://www.fsf.org/licensing/licenses/info/GPLv2.html and
 ** http://www.gnu.org/copyleft/gpl.html.  In addition, as a special
 ** exception, Nokia gives you certain additional rights. These rights
 ** are described in the Nokia Qt GPL Exception version 1.3, included in
 ** the file GPL_EXCEPTION.txt in this package.
 **
 ** Qt for Windows(R) Licensees
 ** As a special exception, Nokia, as the sole copyright holder for Qt
 ** Designer, grants users of the Qt/Eclipse Integration plug-in the
 ** right for the Qt/Eclipse Integration to link to functionality
 ** provided by Qt Designer and its related libraries.
 **
 ** If you are unsure which license is appropriate for your use, please
 ** contact the sales department at qt-sales@nokia.com.
 **
 ****************************************************************************/

 #include <QtCore/QProcess>
 #include <QtCore/QTextStream>
 #include <QtCore/QLibraryInfo>
 #include <QtCore/QDir>
 #include <QtGui/QMessageBox>

 #include "assistant.h"

 Assistant::Assistant()
     : proc(0)
 {
 }

 Assistant::~Assistant()
 {
     if (proc && proc->state() == QProcess::Running) {
         proc->terminate();
         proc->waitForFinished(3000);
     }
 }

 void Assistant::showDocumentation(const QString &page)
 {
     if (!startAssistant())
         return;
     QTextStream str(proc);
     str << QLatin1String("SetSource qthelp://ve.gob.cenditel.safet.inflow/doc/")
         << page << QLatin1Char('\0') << endl;
 }

 bool Assistant::startAssistant()
 {
     if (!proc)
         proc = new QProcess();

     if (proc->state() != QProcess::Running) {
         QString app = QLibraryInfo::location(QLibraryInfo::BinariesPath) + QDir::separator();
 #if !defined(Q_OS_MAC)
         app += QLatin1String("assistant");
 #else
         app += QLatin1String("Assistant.app/Contents/MacOS/Assistant");
 #endif
	 QString helpFile = "/usr/share/inflow/inflowDoc.qhc";
         QStringList args;
         args << QLatin1String("-collectionFile")
	     << QLatin1String(qPrintable(helpFile))
             << QLatin1String("-enableRemoteControl");

	SafetYAWL::streamlog << SafetLog::Action << QObject::tr("Cargando plantilla de ayuda de la ubicaci�n: \"%1\" ").arg(helpFile);

         proc->start(app, args);

         if (!proc->waitForStarted()) {
             QMessageBox::critical(0, QObject::tr("InFlow"),
                 QObject::tr("Unable to launch Qt Assistant (%1)").arg(app));
             return false;
         }
     }
     return true;
 }